<script lang="ts">
  import {
    cleanMessageText,
    dateFormat,
    formatForwardSource,
    getFixedRandomColor,
    getMediaUrl,
    getRecentMessages,
    unescapeHtml
  } from "$lib/functions";
  import type { TGDMessage, TGDResponse } from "$types";
  import { onMount, tick } from "svelte";

  export let data: TGDResponse | TGDMessage[] | undefined = undefined;
  export let innerWidth: number = 9999;

  let chatEl: HTMLDivElement;
  let messages: TGDMessage[] = [];
  let olderAfter: number | null = null;
  let newerAfter: number | null = null;
  let newestMsgId: number | null = null;

  let loadingOlder = false;
  let loadingNewer = false;
  let loadingInitial = false;
  let isJumpingReply = false;
  let apiError = false;

  let isNearBottom = true;
  let showScrollBottomBtn = false;
  let unreadCount = 0;

  let activeDayBadge = "";
  let showDayBadge = false;
  let dayBadgeTimeout: ReturnType<typeof setTimeout> | null = null;
  let livePollTimer: ReturnType<typeof setInterval> | null = null;
  let highlightedMsgId: number | null = null;
  let highlightTimeout: ReturnType<typeof setTimeout> | null = null;

  function initFromData(input: TGDResponse | TGDMessage[] | undefined) {
    if (!input) return;
    if (Array.isArray(input)) {
      messages = input;
      if (messages.length > 0) {
        newestMsgId = messages[messages.length - 1].msg_id;
      }
    } else if (input.messages) {
      messages = input.messages;
      olderAfter = input.older_after ?? null;
      newerAfter = input.newer_after ?? null;
      newestMsgId = input.newest_msg_id ?? messages[messages.length - 1]?.msg_id ?? null;
    }
  }

  $: if (data && messages.length === 0) {
    initFromData(data);
  }

  const scrollToBottom = (behavior: "smooth" | "auto" | "instant" = "smooth") => {
    if (!chatEl) return;
    chatEl.scrollTo({
      top: chatEl.scrollHeight,
      behavior
    });
    unreadCount = 0;
  };

  const updateFloatingDateBadge = () => {
    if (!chatEl) return;
    const containerTop = chatEl.getBoundingClientRect().top + 32;
    const msgEls = chatEl.querySelectorAll<HTMLElement>("[data-day]");
    let day = "";

    for (let i = 0; i < msgEls.length; i++) {
      const rect = msgEls[i].getBoundingClientRect();
      if (rect.top <= containerTop) {
        const d = msgEls[i].getAttribute("data-day");
        if (d) day = d;
      } else {
        if (!day && i === 0) {
          day = msgEls[i].getAttribute("data-day") || "";
        }
        break;
      }
    }

    if (day) {
      activeDayBadge = day;
      showDayBadge = true;
      if (dayBadgeTimeout) clearTimeout(dayBadgeTimeout);
      dayBadgeTimeout = setTimeout(() => {
        showDayBadge = false;
      }, 1200);
    }
  };

  const handleScroll = () => {
    if (!chatEl) return;
    const { scrollTop, scrollHeight, clientHeight } = chatEl;
    const distFromBottom = scrollHeight - scrollTop - clientHeight;

    isNearBottom = distFromBottom < 60;
    showScrollBottomBtn = distFromBottom > 140 || newerAfter !== null;

    if (isNearBottom) {
      unreadCount = 0;
    }

    updateFloatingDateBadge();

    // Infinite scroll UP: load older messages
    if (scrollTop < 80 && olderAfter !== null && !loadingOlder && !isJumpingReply) {
      loadOlderMessages();
    }

    // Infinite scroll DOWN: load newer messages if navigating back from history
    if (distFromBottom < 80 && newerAfter !== null && !loadingNewer && !isJumpingReply) {
      loadNewerMessages();
    }
  };

  const loadOlderMessages = async () => {
    if (loadingOlder || olderAfter === null) return;
    loadingOlder = true;

    const prevScrollHeight = chatEl.scrollHeight;
    const prevScrollTop = chatEl.scrollTop;

    try {
      const res = await getRecentMessages({ limit: 30, after: olderAfter });
      if (res.messages && res.messages.length > 0) {
        const existingIds = new Set(messages.map((m) => m.msg_id));
        const fresh = res.messages.filter((m) => !existingIds.has(m.msg_id));

        if (fresh.length > 0) {
          messages = [...fresh, ...messages];
          olderAfter = res.older_after ?? null;

          await tick();
          // Preserve exact scroll position so the view doesn't jump
          const scrollDiff = chatEl.scrollHeight - prevScrollHeight;
          chatEl.scrollTop = prevScrollTop + scrollDiff;
        } else {
          olderAfter = res.older_after ?? null;
        }
      } else {
        olderAfter = null;
      }
    } catch (err) {
      console.error("Failed to load older messages:", err);
    } finally {
      loadingOlder = false;
    }
  };

  const loadNewerMessages = async () => {
    if (loadingNewer || newerAfter === null) return;
    loadingNewer = true;

    try {
      const res = await getRecentMessages({ limit: 30, after: newerAfter });
      if (res.messages && res.messages.length > 0) {
        const existingIds = new Set(messages.map((m) => m.msg_id));
        const fresh = res.messages.filter((m) => !existingIds.has(m.msg_id));

        if (fresh.length > 0) {
          const wasNearBottom = isNearBottom;
          messages = [...messages, ...fresh];
          newerAfter = res.newer_after ?? null;
          if (res.newest_msg_id) newestMsgId = res.newest_msg_id;

          await tick();
          if (wasNearBottom) {
            scrollToBottom("smooth");
          }
        } else {
          newerAfter = res.newer_after ?? null;
        }
      } else {
        newerAfter = null;
      }
    } catch (err) {
      console.error("Failed to load newer messages:", err);
    } finally {
      loadingNewer = false;
    }
  };

  const flashMessage = (id: number) => {
    highlightedMsgId = id;
    if (highlightTimeout) clearTimeout(highlightTimeout);
    highlightTimeout = setTimeout(() => {
      highlightedMsgId = null;
    }, 1800);
  };

  const jumpToMessage = async (targetMsgId: number, href?: string) => {
    const scrollBehavior: "smooth" | "auto" | "instant" = innerWidth >= 1280 ? "smooth" : "auto";

    // 1. If message is already loaded in the DOM
    const existingEl = document.getElementById(`msg-${targetMsgId}`);
    if (existingEl) {
      existingEl.scrollIntoView({ behavior: scrollBehavior, block: "center" });
      flashMessage(targetMsgId);
      return;
    }

    // 2. Off-screen: load centered around cursor
    let cursor: number | null = null;
    if (href) {
      const cleanHref = href.replaceAll("&amp;", "&");
      const match = cleanHref.match(/[?&]after=(\d+)/);
      if (match) {
        cursor = parseInt(match[1], 10);
      }
    }
    if (cursor === null) {
      cursor = targetMsgId > 15 ? targetMsgId - 15 : 0;
    }

    isJumpingReply = true;
    try {
      const res = await getRecentMessages({ limit: 30, after: cursor });
      if (res.messages && res.messages.length > 0) {
        messages = res.messages;
        olderAfter = res.older_after ?? null;
        newerAfter = res.newer_after ?? null;
        newestMsgId = res.newest_msg_id ?? null;

        await tick();
        const targetEl = document.getElementById(`msg-${targetMsgId}`);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: scrollBehavior, block: "center" });
          flashMessage(targetMsgId);
        }
      }
    } catch (err) {
      console.error("Failed to jump to reply:", err);
    } finally {
      isJumpingReply = false;
    }
  };

  const handleJumpToLatest = async () => {
    if (newerAfter !== null) {
      loadingNewer = true;
      try {
        const res = await getRecentMessages({ limit: 30 });
        if (res.messages && res.messages.length > 0) {
          messages = res.messages;
          olderAfter = res.older_after ?? null;
          newerAfter = null;
          newestMsgId = res.newest_msg_id ?? null;
          await tick();
          scrollToBottom("instant");
        }
      } catch (err) {
        console.error("Failed to jump to latest:", err);
      } finally {
        loadingNewer = false;
      }
    } else {
      scrollToBottom("smooth");
    }
    unreadCount = 0;
  };

  const lookupUserName = (userId: number): string | undefined => {
    const match = messages.find((m) => m.sender?.id === userId);
    return match?.sender?.name;
  };

  const checkLiveMessages = async () => {
    if (typeof document !== "undefined" && document.hidden) return;
    if (newerAfter !== null || newestMsgId === null || loadingOlder || loadingNewer) return;

    try {
      const res = await getRecentMessages({ limit: 30, after: newestMsgId });
      if (res.messages && res.messages.length > 0) {
        const existingIds = new Set(messages.map((m) => m.msg_id));
        const fresh = res.messages.filter((m) => !existingIds.has(m.msg_id));

        if (fresh.length > 0) {
          const wasNearBottom = isNearBottom;
          messages = [...messages, ...fresh];
          if (res.newest_msg_id && res.newest_msg_id > newestMsgId) {
            newestMsgId = res.newest_msg_id;
          }

          await tick();
          if (wasNearBottom) {
            scrollToBottom("smooth");
          } else {
            unreadCount += fresh.length;
          }
        }
      }
    } catch {
      // Ignore live tick errors
    }
  };

  onMount(() => {
    if (messages.length === 0) {
      loadingInitial = true;
      getRecentMessages({ limit: 30 })
        .then(async (res) => {
          initFromData(res);
          await tick();
          if (chatEl) {
            chatEl.scrollTop = chatEl.scrollHeight;
          }
        })
        .catch(() => {
          apiError = true;
        })
        .finally(() => {
          loadingInitial = false;
        });
    } else {
      requestAnimationFrame(() => {
        if (chatEl) {
          chatEl.scrollTop = chatEl.scrollHeight;
        }
        setTimeout(() => {
          if (chatEl && isNearBottom) {
            chatEl.scrollTop = chatEl.scrollHeight;
          }
        }, 150);
      });
    }

    livePollTimer = setInterval(checkLiveMessages, 3500);

    return () => {
      if (livePollTimer) clearInterval(livePollTimer);
      if (dayBadgeTimeout) clearTimeout(dayBadgeTimeout);
      if (highlightTimeout) clearTimeout(highlightTimeout);
    };
  });
</script>

<div
  class="border border-neutral-800 rounded-xl overflow-hidden
        w-full md:max-w-lg lg:max-w-3xl xl:w-[20rem] flex flex-col relative bg-neutral-950/40"
>
  <!-- CHAT HEADER -->
  <div
    class="flex px-5 py-2.5 border-b border-neutral-800 justify-center items-center bg-neutral-900/60 backdrop-blur z-20"
  >
    <h1 class="text-base font-bold text-center w-full text-neutral-200">Recent Group Messages</h1>
  </div>

  <!-- CHAT CONTAINER -->
  <div class="relative flex-1">
    <!-- FLOATING DATE BADGE -->
    {#if showDayBadge && activeDayBadge}
      <div
        class="absolute top-2 left-1/2 -translate-x-1/2 z-30 pointer-events-none transition-opacity duration-300"
      >
        <span
          class="bg-neutral-900/90 backdrop-blur border border-neutral-700/80 text-neutral-200 text-xs px-3 py-1 rounded-full shadow-lg font-medium select-none"
        >
          {activeDayBadge}
        </span>
      </div>
    {/if}

    <!-- SCROLL TO BOTTOM BUTTON -->
    {#if showScrollBottomBtn}
      <button
        on:click={handleJumpToLatest}
        class="absolute right-4 bottom-4 z-30 bg-neutral-800/90 hover:bg-neutral-700
               text-sky-400 p-2.5 rounded-full border border-neutral-700
               shadow-lg shadow-black/50 backdrop-blur transition-all duration-200
               hover:scale-105 active:scale-95 flex items-center justify-center group"
        title="Scroll to latest messages"
        aria-label="Scroll to bottom"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-4 h-4 transition-transform group-hover:translate-y-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2.5"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
        {#if unreadCount > 0}
          <span
            class="absolute -top-1.5 -left-1.5 bg-sky-500 text-neutral-950 font-bold text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center shadow"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        {/if}
      </button>
    {/if}

    <!-- MESSAGES SCROLL LIST -->
    <div
      bind:this={chatEl}
      on:scroll={handleScroll}
      class="px-3 py-2 space-y-2 text-sm h-[520px] max-h-[520px] overflow-y-auto overscroll-contain relative scroll-smooth-none"
    >
      <!-- LOADING OLDER SPINNER -->
      {#if loadingOlder}
        <div class="flex items-center justify-center py-2 space-x-2 text-xs text-neutral-400">
          <svg
            class="animate-spin h-3.5 w-3.5 text-sky-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading older messages…</span>
        </div>
      {/if}

      {#if loadingInitial}
        <div class="flex flex-col items-center justify-center h-full py-16 space-y-3">
          <svg
            class="animate-spin h-6 w-6 text-sky-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span class="text-xs text-neutral-400">Loading messages…</span>
        </div>
      {:else if apiError || messages.length === 0}
        <div class="text-red-400/90 italic text-center p-4 text-xs">
          Cannot connect to the TGD API.<br />Please check connection or visit TGD Web directly.
        </div>
      {:else}
        {#each messages as msg, i (msg.msg_id)}
          <!-- DAY SEPARATOR -->
          {#if i === 0 || msg.day !== messages[i - 1].day}
            <div class="flex justify-center my-3 pointer-events-none select-none">
              <span
                class="bg-neutral-900/80 border border-neutral-800 text-neutral-400 text-[11px] px-2.5 py-0.5 rounded-full shadow-sm"
              >
                {msg.day}
              </span>
            </div>
          {/if}

          <!-- MESSAGE WRAPPER -->
          <div
            id={`msg-${msg.msg_id}`}
            data-day={msg.day}
            class="chat chat-start w-full transition-all duration-300"
          >
            <!-- SENDER AVATAR -->
            <div class="chat-image avatar">
              <div class="w-8 h-8 rounded-full overflow-hidden bg-neutral-800 select-none">
                {#if msg.sender.photo_url}
                  <img
                    src={getMediaUrl(msg.sender.photo_url)}
                    alt=""
                    class="w-full h-full object-cover"
                    draggable="false"
                    loading="lazy"
                    on:error={(e) => {
                      if (e.currentTarget instanceof HTMLElement) {
                        e.currentTarget.style.display = "none";
                      }
                    }}
                  />
                {:else}
                  <div
                    class="w-full h-full flex items-center justify-center font-bold text-xs {getFixedRandomColor(
                      msg.sender.name
                    )[0]}"
                  >
                    {msg.sender.name.charAt(0).toUpperCase()}
                  </div>
                {/if}
              </div>
            </div>

            <!-- BUBBLE -->
            <div
              id={`msg-${msg.msg_id}-bubble`}
              class="chat-bubble transition-all duration-300 ease-in-out
                     {highlightedMsgId === msg.msg_id
                ? '!bg-neutral-800 !ring-2 !ring-sky-500 scale-[1.02]'
                : ''}"
            >
              <!-- SENDER HEADER -->
              <div class="chat-header font-semibold pb-1 line-clamp-1 flex items-baseline gap-1.5">
                <span class={getFixedRandomColor(msg.sender.name)[0]}>
                  {unescapeHtml(msg.sender.name)}
                </span>
                {#if msg.sender.username}
                  <span class="text-[11px] text-neutral-500 font-normal">
                    @{msg.sender.username}
                  </span>
                {/if}
              </div>

              <!-- FORWARD HEADER -->
              {#if msg.forward}
                <div class="text-[11px] text-sky-400/90 font-medium mb-1">
                  Forwarded from {formatForwardSource(msg.forward, msg.sender, lookupUserName)}
                </div>
              {/if}

              <!-- REPLY PREVIEW -->
              {#if msg.reply}
                <button
                  type="button"
                  on:click={() => jumpToMessage(msg.reply?.msg_id ?? 0, msg.reply?.href)}
                  class="flex flex-col w-full my-1 py-0.5 px-2 border-l-2 border-sky-400
                         bg-neutral-800/40 hover:bg-neutral-800/80 rounded-r-md text-left
                         transition-colors duration-150 cursor-pointer select-none"
                >
                  <span
                    class="text-[11px] font-semibold line-clamp-1 {getFixedRandomColor(
                      msg.reply.sender_name || ''
                    )[0]}"
                  >
                    {unescapeHtml(msg.reply.sender_name) || "Replied message"}
                  </span>
                  <span class="text-[11px] text-neutral-300 line-clamp-1 opacity-80">
                    {msg.reply.deleted
                      ? "(deleted message)"
                      : cleanMessageText(msg.reply.snippet || msg.reply.content_type)}
                  </span>
                </button>
              {/if}

              <!-- MEDIA: ALBUM -->
              {#if msg.is_album && msg.items && msg.items.length > 0}
                <div
                  class="grid {msg.items.length > 1
                    ? 'grid-cols-2'
                    : 'grid-cols-1'} gap-1 my-1.5 rounded-lg overflow-hidden"
                >
                  {#each msg.items as item}
                    {#if item.media}
                      {#if item.media.render === "video"}
                        <video
                          controls
                          preload="metadata"
                          playsinline
                          class="w-full h-28 object-cover rounded bg-black"
                          src={getMediaUrl(item.media.url)}
                        >
                          <track kind="captions" />
                        </video>
                      {:else}
                        <a
                          href={getMediaUrl(item.media.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          class="block group relative"
                        >
                          <img
                            src={getMediaUrl(item.media.url)}
                            alt=""
                            class="w-full h-28 object-cover rounded hover:opacity-90 transition duration-150"
                            loading="lazy"
                          />
                        </a>
                      {/if}
                    {/if}
                  {/each}
                </div>
              {:else if msg.content_type === "sticker"}
                <!-- MEDIA: STICKER -->
                {#if msg.media?.url}
                  <div class="my-1 select-none">
                    {#if msg.media.render === "animation"}
                      <video
                        autoplay
                        loop
                        muted
                        playsinline
                        preload="metadata"
                        class="w-24 h-24 object-contain"
                        src={getMediaUrl(msg.media.url)}
                      >
                        <track kind="captions" />
                      </video>
                    {:else}
                      <img
                        src={getMediaUrl(msg.media.url)}
                        alt="Sticker"
                        class="w-24 h-24 object-contain"
                        loading="lazy"
                      />
                    {/if}
                  </div>
                {/if}
              {:else if (msg.content_type === "video" || msg.media?.render === "video") && msg.media?.url}
                <!-- MEDIA: SINGLE VIDEO -->
                <div class="my-1.5 rounded-lg overflow-hidden bg-black/60">
                  <video
                    controls
                    preload="metadata"
                    playsinline
                    class="w-full max-h-56 rounded-lg object-contain bg-black"
                    src={getMediaUrl(msg.media.url)}
                  >
                    <track kind="captions" />
                  </video>
                </div>
              {:else if (msg.content_type === "animation" || msg.media?.render === "animation") && msg.media?.url}
                <!-- MEDIA: ANIMATION / GIF -->
                <div class="my-1.5 rounded-lg overflow-hidden bg-black/40">
                  <video
                    autoplay
                    loop
                    muted
                    playsinline
                    preload="metadata"
                    class="w-full max-h-56 rounded-lg object-contain"
                    src={getMediaUrl(msg.media.url)}
                  >
                    <track kind="captions" />
                  </video>
                </div>
              {:else if (msg.content_type === "photo" || msg.media?.render === "image") && msg.media?.url}
                <!-- MEDIA: PHOTO -->
                <div class="my-1.5 rounded-lg overflow-hidden">
                  <a
                    href={getMediaUrl(msg.media.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="block group relative"
                  >
                    <img
                      src={getMediaUrl(msg.media.url)}
                      alt=""
                      class="w-full max-h-56 rounded-lg object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                      loading="lazy"
                    />
                  </a>
                </div>
              {/if}

              <!-- MESSAGE TEXT -->
              {#if msg.text}
                <div
                  class="msg-text text-neutral-200 text-xs sm:text-sm leading-relaxed break-words"
                >
                  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                  {@html msg.text}
                </div>
              {/if}

              <!-- LINK PREVIEW CARD -->
              {#if msg.link_preview}
                <a
                  href={msg.link_preview.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="block my-1.5 p-2 rounded-lg bg-neutral-800/40 border-l-2 border-sky-400 hover:bg-neutral-800/70 transition text-left"
                >
                  {#if msg.link_preview.site_name}
                    <div class="text-[10px] font-bold uppercase tracking-wider text-sky-400">
                      {msg.link_preview.site_name}
                    </div>
                  {/if}
                  {#if msg.link_preview.title}
                    <div class="text-xs font-semibold text-neutral-200 line-clamp-1 mt-0.5">
                      {msg.link_preview.title}
                    </div>
                  {/if}
                  {#if msg.link_preview.description}
                    <div class="text-[11px] text-neutral-400 line-clamp-2 mt-0.5">
                      {msg.link_preview.description}
                    </div>
                  {/if}
                  {#if msg.link_preview.media?.url}
                    <img
                      src={getMediaUrl(msg.link_preview.media.url)}
                      alt=""
                      class="w-full max-h-32 object-cover rounded mt-1.5"
                      loading="lazy"
                    />
                  {/if}
                </a>
              {/if}

              <!-- FOOTER / TIME / TELEGRAM LINK -->
              <div
                class="flex items-center justify-between pt-1.5 space-x-2 text-[10px] text-neutral-400 select-none"
              >
                <a
                  href={`https://t.me/gnuweeb/${msg.msg_id}`}
                  draggable="false"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-sky-400 opacity-80 hover:opacity-100 font-medium transition-opacity flex items-center gap-1"
                >
                  <span>Telegram</span>
                  <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>

                <div class="flex items-center space-x-1.5 opacity-70">
                  {#if msg.is_edited}
                    <span class="text-neutral-500 italic">edited</span>
                  {/if}
                  <time datetime={msg.date}>{dateFormat(msg.date)}</time>
                </div>
              </div>
            </div>
          </div>
        {/each}
      {/if}

      <!-- LOADING NEWER SPINNER -->
      {#if loadingNewer}
        <div class="flex items-center justify-center py-2 space-x-2 text-xs text-neutral-400">
          <svg
            class="animate-spin h-3.5 w-3.5 text-sky-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading newer messages…</span>
        </div>
      {/if}
    </div>
  </div>

  <!-- JOIN BUTTON FOOTER -->
  <a href="https://t.me/gnuweeb" draggable="false" target="_blank" rel="noopener noreferrer">
    <div
      class="p-2.5 border-t border-neutral-800 hover:bg-neutral-800/80
            flex justify-center items-center w-full transition-colors duration-200"
    >
      <span class="select-none font-semibold text-sky-500 text-sm mr-1.5">Join</span>
      <svg
        class="w-3 h-3 text-neutral-500"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
      >
        <path
          d="M 40.960938 4.9804688 A 2.0002 2.0002 0 0 0 40.740234 5 L 28 5 A 2.0002 2.0002 0 1 0 28 9 L 36.171875 9 L 22.585938 22.585938 A 2.0002 2.0002 0 1 0 25.414062 25.414062 L 39 11.828125 L 39 20 A 2.0002 2.0002 0 1 0 43 20 L 43 7.2460938 A 2.0002 2.0002 0 0 0 40.960938 4.9804688 z M 12.5 8 C 8.3826878 8 5 11.382688 5 15.5 L 5 35.5 C 5 39.617312 8.3826878 43 12.5 43 L 32.5 43 C 36.617312 43 40 39.617312 40 35.5 L 40 26 A 2.0002 2.0002 0 1 0 36 26 L 36 35.5 C 36 37.446688 34.446688 39 32.5 39 L 12.5 39 C 10.553312 39 9 37.446688 9 35.5 L 9 15.5 C 9 13.553312 10.553312 12 12.5 12 L 22 12 A 2.0002 2.0002 0 1 0 22 8 L 12.5 8 z"
        />
      </svg>
    </div>
  </a>
</div>

<style lang="postcss">
  .chat {
    @apply grid gap-x-2.5 py-0.5;
  }

  .chat-start {
    @apply place-items-start grid-cols-[auto,1fr];
  }

  .chat-image {
    @apply row-span-2 self-end pb-1;
  }

  .chat-start .chat-image {
    @apply col-start-1;
  }

  .chat-start .chat-header {
    @apply col-start-2;
  }

  .chat-bubble {
    @apply relative block w-fit px-3 py-1.5 max-w-[88%] rounded-2xl
    min-h-[2.5rem] bg-neutral-900 text-neutral-300 shadow-sm border border-neutral-800/60;
  }

  .chat-start .chat-bubble {
    @apply col-start-2 rounded-bl-sm;
  }

  .avatar {
    @apply relative inline-flex;
  }

  .avatar > div {
    @apply block aspect-square overflow-hidden;
  }

  :global(.msg-text a) {
    color: rgb(56 189 248);
    text-decoration: underline;
    text-underline-offset: 2px;
    word-break: break-all;
  }

  :global(.msg-text a:hover) {
    color: rgb(125 211 252);
  }
</style>
