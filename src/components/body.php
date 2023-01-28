<!DOCTYPE html>
<html>
<head>
	<title><?= e($opt["title"] ?? "") ?> - <?= e(APP_TITLE); ?></title>
	<?php require __DIR__."/head.php"; ?>
</head>
<body>
<?= $content; ?>
</body>
</html>
