<script lang="ts">
  import { STORAGE_URL } from "$lib";
  import { cleanMessageText, getFixedRandomColor, setupUserName } from "$lib";
  import { dateFormat, getRepliedMessage } from "$lib/functions";
  import type { RecentMessagesReturnType } from "$types";
  import { onMount } from "svelte";

  export let data: RecentMessagesReturnType[];
  export let innerWidth: number;

  let chatRootEl: HTMLDivElement;
  let err: any;

  const gotoReply = (msgId: number) => {
    const targetReply = document.getElementById(msgId.toString());
    const highlightReply = document.getElementById(`${msgId}-highlight`);

    targetReply?.scrollIntoView({
      behavior: innerWidth >= 1280 ? "smooth" : "instant",
      block: "end",
      inline: "nearest"
    });

    highlightReply?.classList.add(
      "!bg-neutral-700", "!scale-105"
    );

    setTimeout(() => {
      highlightReply?.classList.remove(
        "!bg-neutral-700", "!scale-105"
      );
    }, 2000);
  }

  onMount(() => {
    chatRootEl.lastElementChild?.scrollIntoView({
      behavior: "smooth", block: "end", inline: "nearest"
    });
  })
</script>


<div
  class="border border-neutral-800 rounded-xl overflow-hidden
        w-full md:max-w-lg lg:max-w-3xl xl:w-[20rem]"
>

  <div class="flex px-5 py-2 border-b border-neutral-800 justify-between items-center">
    <h1 class="text-lg font-bold text-center w-full">Recent Group Messages</h1>
  </div>

  <div
    bind:this={chatRootEl}
    class="px-3 py-2 space-y-1 text-sm max-h-[500px] overflow-y-auto"
  >

    {#if data.length === 0}
      <div class="text-red-500 italic text-center p-3">
        Cannot Connect to the API.<br>API Connection failure.
      </div>

    {:else}
      {#each data as msg}

          <div
            id={msg.message_id.toString()}
            class="chat chat-start w-full"
          >

            <div class="chat-image avatar">
              <div class="w-10 rounded-full">
                <img
                  src={STORAGE_URL + msg.user_photo}
                  alt=""
                  draggable="false"
                >
              </div>
            </div>

            <div
              id={msg.message_id.toString() + "-highlight"}
              class="chat-bubble transition before:transition duration-500
                    before:duration-500 ease-in-out before:ease-in-out
                    delay-200 before:delay-200"
            >

              <div
                class="chat-header font-semibold pb-1 line-clamp-1
                      {getFixedRandomColor(msg.first_name)[0]}"
              >
                {setupUserName(msg.first_name, msg.last_name).join("")}
              </div>

              {#if msg.reply_to_message_id !== null}
                {#each getRepliedMessage(msg, data) as rpl}

                  <button
                    on:click={() => gotoReply(msg.reply_to_message_id || 0)}
                    class="flex flex-col w-full !my-2 py-1 pl-2 border-l-2
                          text-start text-sm text-neutral-300 text-opacity-80
                          hover:bg-neutral-800 rounded-r-md rounded-l-sm
                          {getFixedRandomColor(rpl.first_name)[1]}"
                  >
                    <span class="line-clamp-1 font-semibold not-italic select-none
                                {getFixedRandomColor(rpl.first_name)[0]}"
                    >
                      {setupUserName(rpl.first_name, rpl.last_name).join("")}
                    </span>
                    <span class="line-clamp-1 max-w-[200px] xl:max-w-[150px] max-h-min text-start">
                      {cleanMessageText(rpl.text !== null ? rpl.text : "Photo")}
                    </span>
                  </button>

                {/each}
              {/if}

              {#if msg.message_type === "text"}
                <div
                  class="text-neutral-300 max-w-[200px] xl:max-w-[150px] max-h-min
                        line-clamp-2"
                >
                  {cleanMessageText(msg.text !== null ? msg.text : "")}
                </div>

              {:else if msg.message_type === "photo"}
                <div>
                  <div class="relative">
                    <img
                      src={STORAGE_URL + msg.file}
                      alt=""
                      width="250"
                      class="rounded-md mt-1 relative"
                    >
                    <a
                      href={STORAGE_URL + msg.file}
                      target="_blank"
                      draggable="false"
                      class="absolute top-0 flex items-center justify-center
                            w-full h-full rounded-md hover:bg-neutral-900
                            uppercase hover:bg-opacity-60 transition duration-200
                            ease-in-out font-bold text-xl text-white opacity-0
                            hover:opacity-100 select-none"
                    >
                      See
                    </a>
                  </div>

                  {#if msg.text !== null}
                    <div class="text-neutral-300 line-clamp-2 max-w-[200px] xl:max-w-[150px] mt-2">
                      {cleanMessageText(msg.text)}
                    </div>

                  {/if}
                </div>

              {/if}

              <div class="flex items-center justify-between pt-2 space-x-3">
                <a
                  href="https://t.me/gnuweeb/{msg.message_id}"
                  draggable="false"
                  target="_blank"
                  class="text-xs text-sky-400 opacity-70 font-semibold select-none"
                >
                  Read more
                </a>
                <div class="flex justify-end space-x-1 text-xs opacity-70">
                  <time datetime={msg.date}>{dateFormat(msg.date)}</time>
                </div>
              </div>

            </div>

          </div>

      {/each}
    {/if}

  </div>

  <a href="https://t.me/gnuweeb" draggable="false" target="_blank">
    <div
      class="p-3 border-t border-neutral-800 hover:bg-neutral-800
            flex justify-center items-center w-full"
    >
      <span class="select-none font-semibold text-sky-500 mr-1">Join</span>
      <svg class="w-3 h-3 text-neutral-500" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
        <path d="M 40.960938 4.9804688 A 2.0002 2.0002 0 0 0 40.740234 5 L 28 5 A 2.0002 2.0002 0 1 0 28 9 L 36.171875 9 L 22.585938 22.585938 A 2.0002 2.0002 0 1 0 25.414062 25.414062 L 39 11.828125 L 39 20 A 2.0002 2.0002 0 1 0 43 20 L 43 7.2460938 A 2.0002 2.0002 0 0 0 40.960938 4.9804688 z M 12.5 8 C 8.3826878 8 5 11.382688 5 15.5 L 5 35.5 C 5 39.617312 8.3826878 43 12.5 43 L 32.5 43 C 36.617312 43 40 39.617312 40 35.5 L 40 26 A 2.0002 2.0002 0 1 0 36 26 L 36 35.5 C 36 37.446688 34.446688 39 32.5 39 L 12.5 39 C 10.553312 39 9 37.446688 9 35.5 L 9 15.5 C 9 13.553312 10.553312 12 12.5 12 L 22 12 A 2.0002 2.0002 0 1 0 22 8 L 12.5 8 z"></path>
      </svg>
    </div>
  </a>

</div>


<style lang="postcss">
  .chat {
    @apply grid gap-x-3 py-1
  }

  .chat-start {
    @apply place-items-start grid-cols-[auto,1fr];
  }

  .chat-image {
    @apply row-span-2 self-end;
  }

  .chat-start .chat-image {
    @apply col-start-1;
  }

  .chat-start .chat-header {
    @apply col-start-2;
  }

  .chat-bubble {
    @apply relative block w-fit px-4 py-2 max-w-[90%] rounded-2xl
    min-h-[2.75rem] min-w-[2.75rem] bg-neutral-900 text-neutral-500;
  }

  .chat-bubble::before {
    @apply absolute bottom-0 h-3 w-3 bg-inherit content-[""];
    mask-size: contain;
    -webkit-mask-size: contain;
    mask-repeat: no-repeat;
    -webkit-mask-repeat: no-repeat;
    mask-position: center;
    -webkit-mask-position: center;
  }

  .chat-start .chat-bubble {
    @apply col-start-2 rounded-bl-none;
  }

  .chat-start .chat-bubble::before {
    @apply content-[""] -left-3;
    mask-image: url("data:image/svg+xml,%3csvg width='3' height='3' xmlns='http://www.w3.org/2000/svg'%3e%3cpath fill='black' d='m 0 3 L 3 3 L 3 0 C 3 1 1 3 0 3'/%3e%3c/svg%3e");
    -webkit-mask-image: url("data:image/svg+xml,%3csvg width='3' height='3' xmlns='http://www.w3.org/2000/svg'%3e%3cpath fill='black' d='m 0 3 L 3 3 L 3 0 C 3 1 1 3 0 3'/%3e%3c/svg%3e");
  }

  .avatar {
    @apply relative inline-flex;
  }

  .avatar > div {
    @apply block aspect-square overflow-hidden;
  }
</style>
