<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= e($opt["title"] ?? "") ?> - <?= e(APP_TITLE); ?></title>
    <?php require __DIR__ . "/meta.php"; ?>
    <!-- styles -->
    <link rel="stylesheet" href="<?= e(BASEURL); ?>/assets/css/style.css">
    <!-- script -->
    <script async type="module" src="<?= e(BASEURL); ?>/assets/js/turbo.js"></script>
</head>
