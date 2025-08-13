import {
  snakeCaseToTitleCase,
  getFilteredData,
  getProjectDetails,
} from "./common.util.js";

/**
 *
 * @param {string} tag - The HTML tag to create (e.g., 'div', 'a').
 * @param {string} className - The class to add to the element.
 * @param {string} content - The inner text content of the element.
 * @param {string} href - The href attribute if the element is a link.
 * @returns {HTMLElement} - The created HTML element.
 */
export const getElement = (tag, className, content, href) => {
  const element = document.createElement(tag);

  if (className) element.className = className;

  if (content) {
    element.innerText = content;
  }

  if (tag === "a" && href) {
    element.target = "_blank";
    element.href = href;
  }

  return element;
};

const getImageElement = (projectImage = {}, alt, className, viewLiveLink) => {
  const pictureElement = getElement("picture");

  const sourceElement = getElement("source");
  sourceElement.type = "image/avif";
  sourceElement.srcset = projectImage.avif;

  const imageElement = getElement("img", className);
  imageElement.alt = alt;
  imageElement.src = projectImage.webp;
  imageElement.loading = "lazy";
  imageElement.decoding = "async";

  pictureElement.append(sourceElement, imageElement);

  if (viewLiveLink) {
    const anchorTag = getElement("a", null, null, viewLiveLink.href);
    anchorTag.append(pictureElement);
    return anchorTag;
  }
  return pictureElement;
};

const getProjectCard = (
  projectTitle,
  projectDescription,
  projectLinks,
  projectImage,
  projectTags
) => {
  const projectCardElement = getElement("div", "project-card");
  const projectTitleElement = getElement("h2", "project-title", projectTitle);
  const projectDescriptionElement = getElement(
    "p",
    "project-description",
    projectDescription
  );
  const projectLinksElement = getElement("div", "project-links");
  const links = projectLinks.map((linkDetails) =>
    getElement("a", "link", linkDetails.title, linkDetails.href)
  );
  const viewLiveLink = projectLinks.find((link) => link.title === "Try it Now" || link.title === "Codebook");

  const projectImageElement = getImageElement(
    projectImage,
    projectTitle,
    "project-image",
    viewLiveLink
  );

  const projectTagsElement = getElement("div", "project-tags");
  const tags = projectTags.map((tag) => getElement("span", "project-tag", tag));
  projectTagsElement.append(...tags);

  projectLinksElement.append(...links);
  projectCardElement.append(
    projectImageElement,
    projectTitleElement,
    projectDescriptionElement,
    projectLinksElement,
    projectTagsElement
  );
  return projectCardElement;
};

export const renderData = (data) => {
  const renderDataElements = Object.keys(data).map((key) => {
    const fragment = document.createDocumentFragment();
    const sectionTitle = snakeCaseToTitleCase(key);
    const sectionTitleElement = getElement("h2", null, sectionTitle);
    const projectListElement = getElement("div", "project-list");

    if (!data[key].length) {
      fragment.append(
        sectionTitleElement,
        getElement(
          "i",
          "no-results",
          "No results here for applied filters. Try removing some filters"
        )
      );
      return fragment;
    }

    const projectCards = data[key].map((projectDetails) =>
      getProjectCard(
        projectDetails.title,
        projectDetails.description,
        projectDetails.links,
        projectDetails.image,
        projectDetails.tags
      )
    );
    projectListElement.append(...projectCards);

    fragment.append(sectionTitleElement, projectListElement);
    return fragment;
  });

  const mainElement = document.getElementsByTagName("main")?.[0];
  if (mainElement) {
    mainElement.replaceChildren(...renderDataElements);
    if (mainElement.synthetic) {
      return mainElement;
    }
  }
};

/**
 * Do not change the name or location of this function. Used in building the initial HTML for the page in build script.
 */
export const renderFilteredData = async (appliedTags) => {
  const { data } = await getProjectDetails();
  const filteredData = getFilteredData(data, appliedTags);

  const mainElement = renderData(filteredData);
  if (mainElement) {
    return mainElement;
  }
};
