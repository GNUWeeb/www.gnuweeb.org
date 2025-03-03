<script>
  import Footer from "$lib/components/Footer.svelte";
  import "../app.css";
</script>


<!-- head element -->
<svelte:head>
  <meta http-equiv="X-UA-Compatible" content="ie=edge" />
  <meta property="og:title" content="GNU/Weeb" />
  <meta property="og:description" content="We are working to build community through open source technology." />
  <meta property="og:image" content="./og-image.png" />
  <meta property="og:url" content="https://www.gnuweeb.org/" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="GNU/Weeb" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="description" content="We are working to build community through open source technology.">

  <title>GNU/Weeb - Home</title>

  <link rel="shortcut icon" href="./favicon.ico" type="image/x-icon" />
  <link rel="canonical" href="https://www.gnuweeb.org/" />
    <link
    rel="apple-touch-icon"
    sizes="180x180"
    href="./apple-touch-icon.png"
  />
  <link
    rel="icon"
    type="image/png"
    sizes="32x32"
    href="./favicon-32x32.png"
  />
  <link
    rel="icon"
    type="image/png"
    sizes="16x16"
    href="./favicon-16x16.png"
  />
  <link rel="manifest" href="./site.webmanifest" />
</svelte:head>


<div class="w-full flex flex-col gap-5 min-h-screen bg-neutral-950 text-neutral-200">

  <!-- main/root element -->
  <main class="flex justify-center w-full md:px-20 px-5">
    <!-- slot will contains all contents from all the others +page.svelte inside routes/ dir -->
    <slot/>
  </main>

  <!-- footer element -->
  <Footer />

</div>
