<header id="banner" class="body">
    <div id="gw-gear"></div>
        <h1><a href="<?= e(BASEURL); ?>"><?= e(APP_TITLE); ?></a></h1>
        <nav>
            <ul>
                <?php
                    $nav = [
                        // "Home" => "/",
                        "About" => "/about",
                        "Contact" => "/contact",
                        "Signatures" => "/signatures"
                    ];
                    foreach ($nav as $name => $url) {
                        echo "<li><a href=\"$url\">$name</a></li>";
                    }
                ?>
            </ul>
        </nav>
</header>
