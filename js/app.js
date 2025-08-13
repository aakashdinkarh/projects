import { renderFilterTags } from "./filters.js";
import { getCurrentAppliedTags } from "./common.util.js";
import { renderFilteredData } from "./ui.js";

const initProjectDetails = async () => {
  renderFilterTags();

  const appliedTags = getCurrentAppliedTags();
  renderFilteredData(appliedTags);
};

initProjectDetails();
