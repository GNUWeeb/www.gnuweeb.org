<?php

function load_page(string $__page)
{
	$__file = __DIR__."/pages/{$__page}.php";
	if (!file_exists($__file))
		$__file = __DIR__."/pages/404.php";

	ob_start();
	$opt = [];
	require $__file;
	$__out = ob_get_clean();
	load_body($__out, $opt);
}

function web_router(string $uri): bool
{
	$uri = trim($uri, "/");
	$uri = explode("?", $uri)[0];
	do {
		$uri = str_replace("..", "", $uri, $n);
	} while ($n);

	if ($uri === "") {
		$uri = "home";
	} else {
		if (file_exists(PUBLIC_DIR."/{$uri}"))
			return false;
	}

	load_page($uri);
	return true;
}

function load_body(string $content = "", $opt = [])
{
	require __DIR__."/components/body.php";
}

function e(string $str): string
{
	return htmlspecialchars($str, ENT_QUOTES, "UTF-8");
}
