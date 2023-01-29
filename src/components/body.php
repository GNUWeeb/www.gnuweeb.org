<!DOCTYPE html>
<html lang="en">
<?php require __DIR__."/head.php"; ?>
<body id="index" class="home">
	<div id="wrapper">
		<?php require __DIR__."/header.php"; ?>
		<aside id="featured" class="body">
			<article>
				<?= $content; ?>
			</article>
		</aside>
		<?php require __DIR__."/footer.php"; ?>
	</div>
</body>
</html>
