<script lang="ts">
  import OrganizationMembers from "$components/OrganizationMembers.svelte";
  import RecentMessages from "$components/RecentMessages.svelte";

  export let data;
  let copyBtnEl: HTMLButtonElement;
  let copyTxtEl: HTMLButtonElement;
  let innerWidth: number = 9999;

  const copyText = () => {
    navigator.clipboard.writeText(copyTxtEl.innerText);
    copyBtnEl.innerText = "Copied!";
    copyBtnEl.classList.add("bg-neutral-800");
    setTimeout(function () {
      copyBtnEl.innerText = "Copy";
      copyBtnEl.classList.remove("bg-neutral-800");
    }, 3000);
  }
</script>


<!-- RECENT MESSAGES SECTION | RIGHT -->
{#if innerWidth >= 1280}
  <section class="hidden xl:flex flex-col py-5 max-h-screen">
    <RecentMessages data={data.recentMsgData} innerWidth={innerWidth}/>
  </section>
{/if}

<!-- CONTENT PROFILE | CENTER -->
<section class="flex flex-col space-y-3 px-3">

  <!-- PROFILE SECTION -->
  <div class="border border-neutral-800 rounded-b-xl overflow-hidden max-w-xs md:max-w-lg lg:max-w-3xl">
    <img
      src="/img/profile-cover.jpg"
      alt=""
      draggable="false"
      style="filter: brightness(70%);"
    >
    <div class="relative flex flex-col px-5 py-3 space-x-3 space-y-3">
      <div class="flex space-x-1 md:space-x-2 lg:space-x-3 pb-5 border-b border-neutral-800">
        <div class="-mt-16">
          <img
            src="https://github.com/GNUWeeb.png"
            alt="GNU/Weeb's GitHub Profile"
            draggable="false"
            class="rounded-full w-44 border-4 border-neutral-950 bg-neutral-950"
          />
        </div>
        <div class="flex justify-between w-full">
          <div class="text-2xl md:text-3xl font-bold">
            GNU/Weeb
          </div>
          <div>
            <a
              href="https://github.com/GNUWeeb"
              target="_blank"
              title="View GNU/Weeb's Organization on GitHub"
              class="relative bottom-1 p-2 rounded-full hover:bg-neutral-800 flex items-center
                    justify-center transition-colors duration-300 ease-in-out"
              draggable="false"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7"
              >
                <path
                  d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"
                />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
              <span class="sr-only">GitHub</span>
            </a>
          </div>
        </div>
      </div>
      <div class="py-1 space-y-1">
        <h2 class="font-bold text-2xl select-none">About</h2>
        <p class="w-full opacity-70">
          We are working to build a community through open source technology.
        </p>
        <blockquote
          class="px-3 border-l-4 pl-3 !my-7 text-sm border-neutral-200"
        >
          <span class="not-italic font-bold select-none">Note:</span><br />
          <span class="opacity-80 pb-1">
            Members on GitHub must have two-factor auth.
          </span>
        </blockquote>
      </div>
    </div>
  </div>

  <!-- RECENT MESSAGES SECTION - MOBILE | RIGHT -->
  {#if innerWidth < 1280}
    <div class="flex flex-col max-h-screen">
      <RecentMessages data={data.recentMsgData} innerWidth={innerWidth}/>
    </div>
  {/if}

  <!-- MEMBER LIST SECTION - MOBILE | RIGHT -->
  <div class="flex xl:hidden flex-col max-h-screen">
    <OrganizationMembers data={data.memberListData}/>
  </div>

  <!-- MAILING LIST SECTION -->
  <div class="border border-neutral-800 rounded-xl overflow-hidden max-w-3xl">
    <div
      class="flex px-5 py-2 border-b border-neutral-800 justify-between items-center"
    >
      <h1 class="text-lg font-bold text-center w-full select-none">Mailing List</h1>
    </div>
    <div class="px-5 py-3 text-sm">
      <div class="overflow-hidden flex items-center justify-between border rounded-lg
              border-neutral-900 font-mono"
      >
        <button
          bind:this={copyTxtEl} on:click={copyText}
          class="px-3 py-2 select-none cursor-pointer w-full"
        >
          gwml@vger.gnuweeb.org
        </button>
        <button
          bind:this={copyBtnEl} on:click={copyText}
          class="w-fit py-2 px-3 border-l border-neutral-900 hover:border-neutral-800
              hover:bg-neutral-800 transition-colors duration-300 ease-in-out"
          title="Copy to Clipboard"

        >
          Copy
        </button>
      </div>
    </div>
  </div>

  <!-- USEFUL LINKS SECTION -->
  <div class="border border-neutral-800 rounded-xl overflow-hidden max-w-3xl">
    <div
      class="flex px-5 py-2 border-b border-neutral-800 justify-between items-center"
    >
      <h1 class="text-lg font-bold text-center w-full select-none">Useful Links</h1>
    </div>
    <div class="px-5 py-3 grid gap-3 grid-cols-2 text-sm">
      <a
        href="https://t.me/GNUWeeb"
        target="_blank"
        draggable="false"
        class="flex items-center gap-2 justify-center px-3 py-2 border rounded-lg
              border-neutral-900 hover:border-neutral-800 hover:bg-neutral-800
              transition-colors duration-300 ease-in-out"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="w-5 h-5"
        >
          <path d="m22 2-7 20-4-9-9-4Z" />
          <path d="M22 2 11 13" />
        </svg>
        <span class="select-none">Telegram</span>
      </a>
      <a
        href="https://lore.gnuweeb.org/gwml"
        target="_blank"
        draggable="false"
        class="flex items-center gap-2 justify-center px-3 py-2 border rounded-lg
              border-neutral-900 hover:border-neutral-800 hover:bg-neutral-800
              transition-colors duration-300 ease-in-out"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="w-5 h-5"
        >
          <path
            d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4"
          />
          <path d="M19 17V5a2 2 0 0 0-2-2H4" />
          <path d="M15 8h-5" />
          <path d="M15 12h-5" />
        </svg>
        <span class="select-none">GWML Lore</span>
      </a>
      <a
        href="https://discord.gg/GyRxNzK3Zs"
        target="_blank"
        draggable="false"
        class="flex items-center gap-2 justify-center px-3 py-2 border rounded-lg
              border-neutral-900 hover:border-neutral-800 hover:bg-neutral-800
              transition-colors duration-300 ease-in-out"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="w-5 h-5"
        >
          <path
            d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
          />
          <path
            d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
          />
        </svg>
        <span class="select-none">Discord</span>
      </a>
      <a
        href="https://social.gnuweeb.org/"
        target="_blank"
        draggable="false"
        class="flex items-center gap-2 justify-center px-3 py-2 border rounded-lg
              border-neutral-900 hover:border-neutral-800 hover:bg-neutral-800
              transition-colors duration-300 ease-in-out"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="w-5 h-5"
        >
          <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
        </svg>
        <span class="select-none">GW Social</span>
      </a>
    </div>
  </div>

</section>

<!-- MEMBER LIST SECTION | RIGHT -->
<section class="hidden xl:flex flex-col py-5 max-h-screen">
  <OrganizationMembers data={data.memberListData}/>
</section>

<svelte:window bind:innerWidth/>
