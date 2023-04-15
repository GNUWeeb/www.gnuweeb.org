# GNU/Weeb Website

Build comunity through Open Source technology.

Welcome to new website repo for GNU/Weeb. This is a new website for GNU/Weeb.
This website is built with pure PHP native and HTML5.

## How to contribute

You can contribute to this website by forking this repo and make a pull request.
You can also contribute by opening an issue.

## Installation

- Clone this repo.
- `cd` into the root directory.
- copy `config.example.php` to `config.php` and edit it.
- and run this command:

    ```bash
    php -S localhost:8000 -t public public/index.php
    ```

- Open your browser and go to `localhost:8000`

## Configuration

default configuration is:

```php
<?php

define("BASEURL", "http://127.0.0.1:8000");
define("LOGS_DIR", __DIR__."/logs");
define("PUBLIC_DIR", __DIR__."/public");
define("APP_TITLE", "The GNU/Weeb Website");
```

you can call the `config` like this:

```php
<title><?= e(APP_TITLE); ?></title>
```

### Custom config

you can made a custom config for each page for example:

```php
<?php

$opt["type"] = "Something";

?>
```

and call it with `<?= e($opt["type"] ?? "") ?>`
