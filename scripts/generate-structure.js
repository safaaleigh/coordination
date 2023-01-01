const clusterCoordinators = require("../data/cluster-coordinators.json");
const regionalCoordinators = require("../data/regional-coordinators.json");
const RTIBoard = require("../data/board.json");
const resourcePersons = require("../data/resource-persons.json");

const fs = require("fs");
const { execSync } = require("child_process");

function getSlug(text = "") {
  return text.trim().toLowerCase().replace(/ /g, "_");
}

function getExtension(imperative) {
  if (typeof imperative === "string") {
    imperative = imperative.split(", ");
  }

  if (!imperative || imperative.length > 1) {
    return "all.js";
  }

  if (imperative.includes("Study Circles")) {
    return "sc.js";
  }

  if (imperative.includes("Junior Youth Program")) {
    return "jyp.js";
  }

  if (imperative.includes("Children's Classes")) {
    return "cc.js";
  }

  return "all.js";
}

function simplifyClusterName(cluster) {
  const match = cluster.match(/(\w+)-(\d+)-(.*)/);
  if (match) {
    return match[3];
  }
}

function processResource(category) {
  return (resource) => {
    const {
      Cluster: cluster,
      Grouping: grouping,
      "First Name": firstName,
      Imperative: imperative,
    } = resource;
    const name = getSlug(firstName);
    const clusterSlug = simplifyClusterName(getSlug(cluster));

    const groupingSlug = getSlug(grouping);
    const path = ["four-corners", category, groupingSlug, clusterSlug]
      .filter(Boolean)
      .join("/");
    const extension = getExtension(imperative);

    const filename = `${path}/${name}.${extension}`;

    fs.mkdirSync(path, { recursive: true });
    fs.writeFileSync(filename, JSON.stringify(resource, null, 2));
  };
}

execSync("rm -rf four-corners");

clusterCoordinators.forEach(processResource("coordination"));
regionalCoordinators.forEach(processResource("coordination"));
RTIBoard.forEach(processResource("rti-board"));
resourcePersons.forEach(processResource("resource-persons"));
