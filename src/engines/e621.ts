import { ScrapeEngine, ScrapeResult, ScrapedPost, ScrapedTag } from "../ScrapeEngine";
import { TagCategory } from "../BooruTypes";

export default class e621 implements ScrapeEngine {
  name = "e621";

  canImport(url: Location): boolean {
    return url.host == "e621.net" || url.host == "e926.net";
  }

  scrapeDocument(document: Document): ScrapeResult {
    let result = new ScrapeResult(this.name);

    let post = new ScrapedPost();
    post.source = document.location.href;

    // Set image url
    const downloadEl = document.querySelector("#image-download-link > a") as HTMLAnchorElement;
    post.imageUrl = downloadEl?.href;

    // Set rating
    const ratingEl = document.getElementById("post-rating-text") as HTMLSpanElement;
    switch (ratingEl?.innerText) {
      case "Safe":
        post.rating = "safe";
        break;
      case "Questionable":
        post.rating = "sketchy";
        break;
      case "Explicit":
        post.rating = "unsafe";
        break;
    }

    // Set tags
    const tagEls = Array.from(document.querySelectorAll("#tag-list > ul > li")).map((x) => x as HTMLLIElement);

    for (const el of tagEls) {
      const tagName = (el.querySelector(".search-tag") as HTMLAnchorElement)?.innerText;
      let category: TagCategory | undefined;

      switch (el.className) {
        case "category-3":
          category = "copyright";
          break;
        case "category-4":
          category = "character";
          break;
        case "category-1":
          category = "artist";
          break;
        case "category-7":
          category = "meta";
          break;
      }

      if (tagName) {
        let tag = new ScrapedTag(tagName, category);
        post.tags.push(tag);
      }
    }

    // Set source
    const sourceEls = Array.from(document.querySelectorAll(".source-link > a")).map((x) => x as HTMLAnchorElement);
    // We currently only support one source.
    if (sourceEls.length > 0) {
      post.source = sourceEls[0].href;
    }

    result.tryAddPost(post);

    return result;
  }
}
