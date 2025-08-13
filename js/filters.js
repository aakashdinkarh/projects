import { getCurrentAppliedTags, setCurrentAppliedTags, getProjectDetails, isServer } from "./common.util.js";
import { renderFilteredData, getElement } from "./ui.js";

const generateFilterTagElements = (uniqueTags = []) => uniqueTags.map((filterTag) => getElement("button", "filter-tag", filterTag));

const hydrateFilterTagElements = (initialAppliedFilterTags = []) => {
  const tags = document.querySelectorAll(".filter-tag");

  tags.forEach((tagButton) => {
    const filterTag = tagButton.textContent;

    if (initialAppliedFilterTags.includes(filterTag)) {
      tagButton.classList.add("active");
    }

    tagButton.onclick = () => {
      let appliedTags = getCurrentAppliedTags();

      if (appliedTags.includes(filterTag)) {
        appliedTags = appliedTags.filter((tag) => tag !== filterTag);
        tagButton.classList.remove("active");
      } else {
        appliedTags.push(filterTag);
        tagButton.classList.add("active");
      }

      renderFilteredData(appliedTags);
      setTimeout(setCurrentAppliedTags, 0, appliedTags);
    };

    return tagButton;
  });

  return tags;
}

const getFilterTagElements = (uniqueTags = []) => {
  const initialAppliedFilterTags = getCurrentAppliedTags();

  if (isServer()) {
    return generateFilterTagElements(uniqueTags);
  }
  hydrateFilterTagElements(initialAppliedFilterTags);
  return [];
};

export const renderFilterTags = async () => {
  const { uniqueTags } = await getProjectDetails();
  const filterTagElements = getFilterTagElements(uniqueTags);

  if (filterTagElements.length) {
    const filtersContainerElement = document.getElementsByTagName("section")?.[0];

    if (filtersContainerElement) {
      filtersContainerElement.className = "filters";
      filtersContainerElement.innerText = "Filter Tags";
      filtersContainerElement.append('<br />', ...filterTagElements);
    }
    return filtersContainerElement;
  }
};
