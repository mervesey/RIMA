import CytoscapeComponent from "react-cytoscapejs";
import cytoscape from "cytoscape";
import React, {useEffect, useState} from "react";
import cxtmenu from "cytoscape-cxtmenu";
import zoom from "cytoscape-cxtmenu";
import WikiDesc from "../Connect/WikiDesc";
import {toast, ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {Button, Collapse, Dialog, DialogActions, DialogContent, DialogTitle} from "@material-ui/core";
import RestAPI from "../../../../../Services/api";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import swal from 'sweetalert';
import panzoom from "cytoscape-panzoom";
import "cytoscape-panzoom/cytoscape.js-panzoom.css";
import { FaTrash } from "react-icons/fa";
import { Box, TextareaAutosize } from '@material-ui/core';
// binding the panzoom
cytoscape.use(panzoom);

function getColor(currColors) {
  //replace darker colors with lighter ones
  const allColors = [
    "#397367",
    "#EFCB68",
    "#C89FA3",
    "#368F8B",
    "#368F8B",
    "#B6CB9E",
    "#92B4A7",
    "#8C8A93",
    "#8C2155",
    "#22577A",
    "#7FD8BE",
    "#875C74",
    "#9E7682",
    "#FCAB64",
    "#EDCB96",
    "#4e4077",
    "#98B9F2"
  ];
  let pickedColor = "";
  if (allColors.length === currColors.length) {
    currColors = [];
    pickedColor = allColors[0];
  } else {
    let index = currColors.length;
    pickedColor = allColors[index];
    currColors.push(pickedColor);
  }

  return [pickedColor, currColors];
}


function getNodeData(data, values, interest) {
  let ids = [...Array(200).keys()];
  let elements = [
    // Mainnode has a darker color 
    {data: {id: -1, label: interest, level: 0, color: "#172B4D"}}
  ];
  let currColors = [];
  try{data.map((d, index) => {
    if (values[index]) {
      let colors = getColor(currColors);

      currColors = colors[1];

      let label = d.topic;
      let pages = d.relatedTopics;
      let idLevel1 = ids.pop();
      let color = colors[0];

      let element = {
        data: {id: idLevel1, label: label, level: 1, color: color},
        classes: ["level1"]
      };
      let edge = {
        data: {source: -1, target: idLevel1, color: color},
        classes: []
      };
      elements.push(element, edge);

      pages.map((p) => {
        let label = p.title;
        let idLevel2 = ids.pop();
        let pageData = p.summary;

        element = {
          data: {
            id: idLevel2,
            label: label,
            level: 2,
            color: color,
            pageData: pageData,
            url: p.url
          },
          classes: ["level2"]
        };
        edge = {
          data: {target: idLevel2, source: idLevel1, color: color},
          classes: []
        };

        elements.push(element, edge);
      });
    }
  });}
  // Error message
  catch{
    elements = [
      {data: {id: -1, label: "Sorry there is an error.", level: 0, color: "red"}}
    ];
    
  }
  console.log(elements,'xx')
  return elements;
}

const GetNodeLink = (props) => {
 const panzoomOptions = {
  zoomFactor: 0.1, // Factor for the zoom level
  zoomDelay: 45, // Delay (in ms) for the zoom action
  minZoom: 0.1, // Minimum zoom level
  maxZoom: 10, // Maximum zoom level
  fitPadding: 50, // Internal spacing for fitting the graph
  panSpeed: 15, // Speed of the pan
  panDistance: 10, // Distance to pan 
  };

const {interest, categoriesChecked, data, keywords} = props;
 const [openDialog, setOpenDialog] = useState({
    openLearn: null,
    nodeObj: null
  });
  
// Contains data from backend
 const[list,setList]=useState("");

// Data from the backend is received and covert to a new array
  const reloadfinal=()=>{
    RestAPI.getRelatedNewTopics({'data':'12'}).then(res=>{
      const {data} = res;
      const dataRes = {...data.data};
      setList(dataRes);
    })
    let nlist = convertToNewLabelArray(list.relatedTopics);
    return nlist;
  //  let l=  [{label: 'y1', pageData: 'text', url: 'url'}, {label: 'y1', pageData: 'text2', url: 'url2' },{label: 'y2', pageData: 'text3', url: 'url3'}]
  };

// converts array
  function convertToNewLabelArray(dataArray) {
    try {
      const newArray = dataArray.map(item => {
        if (item.title && item.summary && item.url) {
          return {
            label: item.title,
            pageData: item.summary,
            url: item.url
          };
        } else {
          throw new Error("Ungültiges Objektformat");
        }
      });

      return newArray;
    } catch (error) {
      console.error("Fehler beim Konvertieren des Arrays:", error);
      return [];
    }
  }


  // test1
  function updateDataWithNewValues(existingData, newData, source) {
    // Erzeuge Liste liste1 mit Zielen, die als source die übergebene source haben
    const liste1 = existingData.filter(node => node.classes && node.data.source === source);
  
    // Erzeuge liste2 mit den Elementen, bei denen id in liste1.target ist
    const liste2 = existingData.filter(node => liste1.some(item => item.classes === ['level2'] && item.data.target === node.data.id));
  
    // Iteriere durch liste2 und aktualisiere label, pageData und url
    for (const node of liste2) {
      const matchedNewValue = newData.find(item => item.label === node.data.label);
      if (matchedNewValue) {
        node.data.label = matchedNewValue.label;
        node.data.pageData = matchedNewValue.pageData;
        node.data.url = matchedNewValue.url;
      }
    }
  
    return existingData;
  }


  // const reload = async (interest) => {
  //   //setState({...state,userInterests: []})
  //   const response = await RestAPI.getRelatedNewTopics(interest);
  //   const {data} = response;
  //   let dataArray = [];
  //   console.log(response,"related");
  //   data.forEach((d) => {
  //     //console.log(d, "test")
  //     const newData = {
  //       title: d.title,
  //       summary: d.summary,
  //       url: d.url,
  //       interest: d.interest,
  //       failure: d.failure,
  //     };
  //     dataArray.push(newData);
  //   })
  // };

  // const reloadold = async (interest) => {

  //   const response = await RestAPI.getRelatedNewTopics(interest);
  //   const dataArray = response;
  //   const nodes = [];
  //   dataArray.forEach((item) => {
  //     const node = {
  //       data: {
  //         id: "a",
  //         title: "b",
  //         summary: "c",
  //         url: "url",
  //         failure: "failure"
  //       }
  //     };
  //     nodes.push(node);
  //   });
  //   return nodes
  // };
  
  // Favour Interest Feature 
  const [addNewFavourUrl, setAddNewFavourUrl] = useState([]); //list of favored interests 
  const [notes, setNotes] = useState({}); // State to hold notes for each item
  
  // is called when an Intersse is fovourized
  const addFavours= async (currFavour) => {
    let alreadyExist = addNewFavourUrl.some((i) => i.label.toLowerCase() === currFavour.label.toLowerCase());   // checks if label has already been favorited
    console.log("xx Discover get node link", alreadyExist);
    if (!alreadyExist) { 
      console.log("xx Discover get node link already")
      let newFavour = {
        label: currFavour.label.toLowerCase(),
      }
      let newFavourUrl = {
        label: currFavour.label.toLowerCase(),
         url : currFavour.url
       };
       // If no Wikipedia article is found, redirect to the main page
      if (currFavour.url == 'en.wikipedia.org'){
        newFavourUrl = {
          label: currFavour.label.toLowerCase(),
          url : 'https://en.wikipedia.org/wiki/Main_Page'
        }
      }
      setAddNewFavourUrl([...addNewFavourUrl,newFavourUrl]); //update addNewFavourUrl
         // Display a success message
         const msg = `The interest "${currFavour.label}" is added to your favorite interests list`;
         toast.success(msg, {
           toastId: 'addLevel2',
         });
    } else {
      // Display a message indicating that the item already exists
      const msg = `The interest "${currFavour.label}" is already in your favorite interests list`;
      toast.warning(msg, {
        toastId: 'duplicateInterest'
      });
    }
  };
  const validateInterest = (interests, interest) => {
    return interests.some((i) => i.text === interest());
  };

  const addNewInterest = async (currInterest) => {
    console.log("xx Discover get node link", currInterest)
    let alreadyExist = validateInterest(keywords, currInterest);
    console.log("xx Discover get node link", alreadyExist)
    if (!alreadyExist) {
      console.log("xx Discover get node link already")
      let newInterests = keywords;
      let newInterest = {
        id: Date.now(),
        categories: [],
        originalKeywords: [],
        source: "Manual",
        text: currInterest.toLowerCase(),
        value: 3,
      }
      newInterests.push(newInterest);

      newInterests.sort((a, b) => (a.value < b.value) ? 1 : ((b.value < a.value) ? -1 : 0));
      let listOfInterests = [];
      newInterests.forEach(interest => {
        let item = {
          name: interest.text,
          weight: interest.value,
          id: interest.id,
          source: interest.source
        }
        listOfInterests.push(item);
      });
      console.log("xx Updated list Discover get node link", listOfInterests)
      try {
        await RestAPI.addKeyword(listOfInterests);
      } catch (err) {
        console.log("xx",err);
      }
      // console.log(newInterests)
    }
    console.log("Interest already exists in my list!")
  }

  const elements = getNodeData(data, categoriesChecked, interest);

  const handleOpenLearn = (ele) => {
    const data = ele.data();
    setOpenDialog({...openDialog, openLearn: true, nodeObj: data});
  };

  const handleCloseLearn = () => {
    setOpenDialog({...openDialog, openLearn: false});
  };

  // Pop up window appears when deleting Interest level 1 
   function showConfirmationPopup1(ele) {
    swal({
      title: "Are you sure?",
      text: "Do you really want to remove it?",
      icon: "warning",
      buttons: ["Cancel", "Remove"],
      dangerMode: true,
    })
    .then((willRemove) => {
      // The user has clicked on "Remove"
      if (willRemove) {
        let currInterest = ele.data()["label"];
              console.log(currInterest,"test curr");
               // Confirmation of the deletion process
              let msg =
                "The interest " + currInterest + " has been removed";
              toast.error(msg, {
                toastId: "removedLevel1"
              });
              // Neighbor edges and nodes are also removed
              ele.addClass("collapsed");
              ele.successors().addClass("collapsed");
      } else {
        // The user has clicked on "Cancel"
        console.log("Entfernung abgebrochen");
      }
    });
  }

  // Pop up window appears when deleting Interest level 2 
    function showConfirmationPopup2(ele) {
    swal({
      title: "Are you sure?",
      text: "Do you really want to remove it?",
      icon: "warning",
      buttons: ["Cancel", "Remove"],
      dangerMode: true,
    })
    .then((willRemove) => {
      // The user has clicked on "Remove"
      if (willRemove) {
        let currInterest = ele.data()["label"];
              console.log(currInterest,"test curr");
              // Confirmation of the deletion process
              let msg =
                "The interest " + currInterest + " has been removed";
              toast.error(msg, {
                toastId: "removedLevel2"
              });
              
              ele.addClass("collapsed");
      } else {
        // The user has clicked on "Cancel"
        console.log("Entfernung abgebrochen");
      }
    });
  }
  
   // Pop up window appears when deleting from Interest List
   function showConfirmationPopupDeleteFromList(item) {
    swal({
      title: "Are you sure?",
      icon: "warning",
      buttons: ["Cancel", "Remove"],
      dangerMode: true,
    })
    .then((willRemove) => {
      // The user has clicked on "Remove"
      if (willRemove) {
        // Filter the entry from the list
        const updatedList = addNewFavourUrl.filter((i) => i.label !== item.label);
        // Update the state 
        setAddNewFavourUrl(updatedList);
      } else {
        // The user has clicked on "Cancel"
        console.log("Removal canceled");
      }
    });
  }

  const handleNotesChange = (itemText, note) => {
    setNotes((prevNotes) => ({
      ...prevNotes,
      [itemText]: note,
    }));
  };


  const layoutGraph = {
    name: "concentric",
    concentric: function (node) {
      return 10 - node.data("level");
    },
    levelWidth: function () {
      return 1;
    }
  };


  const stylesheet = [
    {
      selector: "node",
      style: {
        width: 200,
        height: 200,
        label: "data(label)",
        "background-color": "data(color)",
        color: "white"
      }
    },
    {
      selector: "edge",
      style: {
        "curve-style": "straight",
        "line-color": "data(color)"
      }
    },
    {
      selector: "node[label]",
      style: {
        "text-halign": "center",
        "text-valign": "center",
        "text-wrap": "wrap",
        "text-max-width": 20,
        "font-size": 20
      }
    },
    {
      selector: ".collapsed", // 
      style: {
        display: "none"
      }
    },
    // Main node
    {
      selector: "node[level=0]",
      style: {
        color: "white",
        shape: "rectangle",
        width: 160,
        height: 160
      }
    },
    // Study field node
    {
      selector: ".level1",
      style: {
        "line-color": "data(color)",
        color: "white",
        shape: "round-rectangle", 
        width: 150,
        height: 150
      }
    },
    {
      selector: ".level2",
      style: {
        "background-opacity": 0.6,
        "line-color": "data(color)"
      }
    },
    {
      selector: ".level3",
      style: {
        "background-opacity": 0.4,
        "line-color": "data(color)"
      }
    }
  ];
 
function generateUniqueId() {
  return Date.now().toString() + Math.random().toString(36);
}

  return (
    <>
    <div style={{ display: "flex" }}>
    <div style={{ flex: 1 }}>
      <CytoscapeComponent
        // elements={elements}
        style={{width: "100%", height: "800px", backgroundColor: "#F8F4F2"}}
        layout={layoutGraph}
        stylesheet={stylesheet}
        cy={(cy) => {
          cy.userZoomingEnabled(false); //disable the zoom option with the mouse
          cy.elements().remove();
          cy.add(elements);
          cy.layout(layoutGraph)
          cy.layout(layoutGraph).run();
          cy.fit();
          cy.panzoom(panzoomOptions);
          let defaultsLevel1 = {
            selector: "node[level=1]",
            menuRadius: 80,
            commands: [
              {
                content: "Reload new topics",
                // label, pageData, url
                contentStyle: {fontSize: "12px"},
                select: function (ele) {
                  ele.successors().addClass("collapsed");
                  let newList = reloadfinal();
                  console.log(newList, "newList");
                  let edges = ele.successors();
                  let ids = [];
                  for (const newItem of newList) {
                    let newId = generateUniqueId(); // Funktion zum Erzeugen einer eindeutigen ID
                    let newNodeData = {
                      classes: ["level2"],
                      data: {
                        id: newId.toString(),
                        label: newItem.label,
                        pageData: newItem.pageData,
                        url: newItem.url,
                        color: "#666", // Setze die gewünschte Farbe
                      },
                    };
                    let newEdgeData = {
                      classes: [],
                      data: {
                        source: ele.data()["id"].toString(),
                        target: newId.toString(),
                        color: "#666", 
                        id: generateUniqueId() 
                      },
                    };
                
                    ids.push(newId);
                    cy.elements().remove();
                    elements.push(newNodeData, newEdgeData);
                    console.log(elements,'cc')
                    cy.add(elements);
                    cy.layout(layoutGraph)
                    cy.layout(layoutGraph).run();
                    cy.fit([ele, ...edges], 16);
                  }
                  // cy.fit([ele, ...edges], 16);
                },
              enabled: true
            },
            {content: "Remove", // html/text content to be displayed in the menu
            contentStyle: {fontSize: "12px"}, // css key:value pairs to set the command's css in js if you want
            select: function (ele) {
              showConfirmationPopup1(ele);
            },
            enabled: true
            }
            ],
            fillColor: "#172B4D", // blue background colour of the menu
            activeFillColor: "grey", // the colour used to indicate the selected command
            activePadding: 6, // additional size in pixels for the active command
            indicatorSize: 24, // the size in pixels of the pointer to the active command, will default to the node size if the node size is smaller than the indicator size,
            separatorWidth: 3, // the empty spacing in pixels between successive commands
            spotlightPadding: 8, // extra spacing in pixels between the element and the spotlight
            adaptativeNodeSpotlightRadius: true, // specify whether the spotlight radius should adapt to the node size
            //minSpotlightRadius: 24, // the minimum radius in pixels of the spotlight (ignored for the node if adaptativeNodeSpotlightRadius is enabled but still used for the edge & background)
            //maxSpotlightRadius: 38, // the maximum radius in pixels of the spotlight (ignored for the node if adaptativeNodeSpotlightRadius is enabled but still used for the edge & background)
            openMenuEvents: "tap", // space-separated cytoscape events that will open the menu; only `cxttapstart` and/or `taphold` work here
            itemColor: "white", // the colour of text in the command's content
            itemTextShadowColor: "transparent", // the text shadow colour of the command's content
            zIndex: 9999, // the z-index of the ui div
            atMouse: false, // draw menu at mouse position
            outsideMenuCancel: 8 // if set to a number, this will cancel the command if the pointer is released outside of the spotlight, padded by the number given
          };

          let defaultsLevel2 = {
            selector: "node[level=2]",
            menuRadius: 80, // the outer radius (node center to the end of the menu) in pixels. It is added to the rendered size of the node. Can either be a number or function as in the example.
           // selector: "node", // elements matching this Cytoscape.js selector will trigger cxtmenus
            commands: [
              // an array of commands to list in the menu or a function that returns the array

              {
                content: "Learn more",
                // html/text content to be displayed in the menu
                contentStyle: {fontSize: "14px"}, // css key:value pairs to set the command's css in js if you want
                select: function (ele) {
                  // a function to execute when the command is selected
                  handleOpenLearn(ele); // `ele` holds the reference to the active element
                },
                enabled: true // whether the command is selectable
              },
              {
                // example command
                //fillColor: "rgba(200, 200, 200, 0.75)", // optional: custom background color for item
                content: "Remove", // html/text content to be displayed in the menu
                contentStyle: {fontSize: "14px"}, // css key:value pairs to set the command's css in js if you want
                select: function (ele) {
                  showConfirmationPopup2(ele);
                },
                enabled: true

                // whether the command is selectable
              },
              {
                // example command
                //fillColor: "rgba(200, 200, 200, 0.75)", // optional: custom background color for item
                content: "Add to my interests", // html/text content to be displayed in the menu
                contentStyle: {fontSize: "14px"}, // css key:value pairs to set the command's css in js if you want
                select: function (ele) {
                  // a function to execute when the command is selected
                  let currInterest = ele.data()["label"];
                  console.log("xx currInterest")
                  addNewInterest(currInterest);
                  let msg = "The interest " + currInterest + " has been saved";
                  toast.success(msg, {
                    toastId: "addLevel2"
                  }); // `ele` holds the reference to the active element
                },
                enabled: true // whether the command is selectable
              },
              {
                // example command
                //fillColor: "rgba(200, 200, 200, 0.75)", // optional: custom background color for item
                content: "Favour", // html/text content to be displayed in the menu
                contentStyle: {fontSize: "14px"}, // css key:value pairs to set the command's css in js if you want
                select: function (ele) {
                 addFavours(ele.data());                 
                },
                enabled: true

                // whether the command is selectable
              }
            ], // function( ele ){ return [ /*...*/ ] }, // a function that returns commands or a promise of commands
            fillColor: "#172B4D", //blue background colour
            activeFillColor: "grey", // the colour used to indicate the selected command
            activePadding: 6, // additional size in pixels for the active command
            indicatorSize: 24, // the size in pixels of the pointer to the active command, will default to the node size if the node size is smaller than the indicator size,
            separatorWidth: 3, // the empty spacing in pixels between successive commands
            spotlightPadding: 8, // extra spacing in pixels between the element and the spotlight
            adaptativeNodeSpotlightRadius: true, // specify whether the spotlight radius should adapt to the node size
            //minSpotlightRadius: 24, // the minimum radius in pixels of the spotlight (ignored for the node if adaptativeNodeSpotlightRadius is enabled but still used for the edge & background)
            //maxSpotlightRadius: 38, // the maximum radius in pixels of the spotlight (ignored for the node if adaptativeNodeSpotlightRadius is enabled but still used for the edge & background)
            openMenuEvents: "tap", // space-separated cytoscape events that will open the menu; only `cxttapstart` and/or `taphold` work here
            itemColor: "white", // the colour of text in the command's content
            itemTextShadowColor: "transparent", // the text shadow colour of the command's content
            zIndex: 9999, // the z-index of the ui div
            atMouse: false, // draw menu at mouse position
            outsideMenuCancel: 8 // if set to a number, this will cancel the command if the pointer is released outside of the spotlight, padded by the number given
          };
          let menu2 = cy.cxtmenu(defaultsLevel2);
          let menu1 = cy.cxtmenu(defaultsLevel1);
        }
      }
      />
      <Dialog open={openDialog.openLearn} onClose={handleCloseLearn}>
        {openDialog.nodeObj != null ? (
          <DialogTitle>Learn More about {openDialog.nodeObj.label}</DialogTitle>
        ) : (
          <DialogTitle>Learn more</DialogTitle>
        )}
        <DialogContent>
          {" "}
          <WikiDesc data={openDialog.nodeObj}/>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseLearn}>Close</Button>
        </DialogActions>
      </Dialog>
      <ToastContainer/>
      </div>
      </div>
    <div style={{ flex: 1 }}></div>
      <Box
        padding="16px"
        backgroundColor="#F5F5F5"
        borderRadius="8px"
        boxShadow="0px 2px 6px rgba(0, 0, 0, 0.5)"
        marginTop="20px"
        fontFamily="Arial, sans-serif"
      >
        <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>
          My favourite interests list
        </h2>
        <table
          style={{
            borderCollapse: 'collapse',
            width: '100%',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          <tbody>
            {addNewFavourUrl.map((item) => (
              <tr key={item.label}>
                <td
                  style={{
                    borderBottom: '1px solid #ddd',
                    padding: '8px',
                    position: 'relative',
                    fontStyle: 'italic',
                    background: '#F5F5F5',
                  }}
                >
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#3366BB',
                      textDecoration: 'none',
                      fontSize: '14px',
                    }}
                  >
                    {item.label}
                  </a>
                  <TextareaAutosize
                    rowsMin={1}
                    rowsMax={10}
                    style={{
                      width: '100%',
                      padding: '8px',
                      marginTop: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      resize: 'vertical',
                    }}
                    value={notes[item.label] || ''} // Get notes from state
                    onChange={(e) => handleNotesChange(item.label, e.target.value)} // Handle notes change
                    
                  />
                  <Button
                    style={{
                      position: 'static',
                      right: '40px',
                      color: '#172B4D',
                    }}
                    onClick={() => showConfirmationPopupDeleteFromList(item)}
                  >
                    <FaTrash />
                  </Button>
                  <Button
                    style={{
                      position: 'static',
                      right: '120px',
                      color: '#172B4D',
                      padding: '2px 5px',
                      borderRadius: '4px',
                      border: '1px solid #999',
                      backgroundColor: '#F5F5F5',
                    }}
                    onClick={() => {
                      addNewInterest(item);
                      let msg = `The interest "${item.label}" has been saved`;
                      toast.success(msg, {
                        toastId: 'addLevel2',
                      });
                    }}
                  >
                    Add to my interests
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
      </>
    );
  };

export default GetNodeLink;

