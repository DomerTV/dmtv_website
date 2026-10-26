# DMTV

Статический сайт DMTV.

## Страницы

| Файл | Что это |
| --- | --- |
| `index.html` | Главная |
| `blog.html` | Новый блог |
| `post.html` | Запись, открывается как `post.html?id=...` |
| `archive.html` | Старый блог DomerTV |
| `about.html` | О проекте |
| `404.html` | Страница ошибки |

Стили - `data/style.css`, общий скрипт - `data/site.js`.

## Как добавить запись в блог

Откройте `data/posts.js`, скопируйте объект и поменяйте поля:

```js
{
  id: "pervaya-zapis",
  title: "Заголовок",
  date: "2026-10-26",
  category: "Категория",
  excerpt: "Короткое описание.",
  body: `
    <p>Текст записи.</p>
  `
}
```

- `id` - уникальный, латиницей, без пробелов;
- `date` - в формате `ГГГГ-ММ-ДД`;
- `category` - любая строка, фильтр соберётся сам;
- `body` - HTML-текст.

Главная и `blog.html` обновятся автоматически. Страница записи:
`post.html?id=pervaya-zapis`.

## Старый блог

Записи DomerTV лежат в `archive.html` и не связаны с новым блогом.

## Картинки

- `data/dmtv-logo.png` - логотип `[ DMTV ]`;
- `data/dmtv-banner.png` - баннер `[ DMTV ] Ginger and more...`;
- `data/favicon.svg` - иконка;
- `data/logo.png` - старый логотип DomerTV.

## Публикация

```sh
git add .
git commit -m "DMTV"
git push
```
