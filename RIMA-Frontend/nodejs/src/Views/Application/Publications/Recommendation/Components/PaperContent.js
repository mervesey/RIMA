import React, { useEffect, useState } from "react";
import "../assets/paper_card.css";
import ReactTooltip from "react-tooltip";
// import TopSimilarityChart from "./TopSimilarityChart";
import {
  Typography,
  Grid,
  Box,
  Chip,
  Switch,
  makeStyles,
  Avatar,
} from "@material-ui/core";
// import { Popover, Menu, MenuItem } from "@material-ui/core";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";

//---------------Hoda Start-----------------
function highlighter(
  paperId,
  keyword,
  max_score,
  max_interest_color,
  originalText,
  lookupkey
) {
  return `<a data-tip="${lookupkey}" aria-describedby="${paperId}"  data-for="${paperId}" data-event="click" title="Similarity Score: ${
    Math.round(max_score * 100) / 100
  }" class="highlight-keyword" style="color:${max_interest_color}">${originalText}</a>`;
}
function KeywordSimObjToArray(keywords_similarity) {
  let items = [];
  let i = 0;
  for (let p2 in keywords_similarity) {
    let value = keywords_similarity[p2];
    items.push({
      keyword: p2,
      weight: value.data_weight,
      max_score: value.data_max_score,
      max_interest_color: value.data_max_interest_color,
      numberOfWord: p2.split(" ").length,
    });
  }
  return items.sort((a, b) =>
    a.numberOfWord < b.numberOfWord
      ? 1
      : a.numberOfWord == b.numberOfWord
      ? 0
      : -1
  );
}
function HighlightText(paperId, keywords_similarity, text) {
  keywords_similarity = KeywordSimObjToArray(keywords_similarity);
  let modified_text = text;
  let replaceList = [];
  for (let index in keywords_similarity) {
    let value = keywords_similarity[index];
    let regEx = new RegExp(value.keyword, "ig");
    let matches = regEx.exec(modified_text);
    if (matches === null) continue;
    //deform originalText to prevent nested highlighting keyword/s
    let originalText = matches[0];
    //.split(" ")
    //.map((x) => "<x>" + x[0] + "</x>" + x.substring(1))
    //.join("&nbsp;");
    let replaceKey = btoa(unescape(encodeURIComponent(value.keyword)));
    const replaceText = highlighter(
      paperId,
      value.keyword,
      value.max_score,
      value.max_interest_color,
      originalText,
      replaceKey
    );
    replaceKey = `<-${replaceKey}->`;
    replaceList.push({ replaceKey, replaceText });
    modified_text = modified_text.replace(regEx, replaceKey);
  }
  replaceList.forEach(
    ({ replaceKey, replaceText }) =>
      (modified_text = modified_text.replaceAll(replaceKey, replaceText))
  );
  return modified_text;
}
// start Tannaz
function SplitText(text) {
  let textArray = text.split(/[\.\!]+(?!\d)\s*|\n+\s*/);
  return textArray;
}
function ArraytoString(array) {
  let string = array.join(". ");
  return string;
}

function executeOnClick(isExpanded) {
  console.log(isExpanded);
}
// End Tannaz

function Title({ paper, similarityScore }) {
  //highlight title
  let modified_title = HighlightText(
    paper.paperId,
    paper.keywords_similarity,
    paper.title
  );
  //---------------Hoda end-----------------
  return (
    <Grid container style={{ justifyContent: "space-between" }}>
      <Grid
        item
        xs={10}
        container
        direction="column"
        justify="flex-start"
        alignItems="flex-start"
      >
        <Grid
          item
          xs
          container
          direction="row"
          style={{ justifyContent: "space-between" }}
          className="new-window"
        >
          <Grid item xs>
            <Typography
              noWrap
              gutterBottom
              variant="h6"
              dangerouslySetInnerHTML={{ __html: modified_title }}
            />
          </Grid>
          <Grid item xs>
            <a
              href={"https://www.semanticscholar.org/paper/" + paper.paperId}
              target="_blank"
              title="open paper in the semantic scholar website"
            >
              <OpenInNewIcon />
            </a>
          </Grid>
        </Grid>
        <Grid item xs>
          <Authors authorsList={paper.authors} />
        </Grid>
      </Grid>
      <Grid
        item
        xs={2}
        container
        direction="row"
        justify="flex-end"
        alignItems="flex-start"
      >
        {paper.modified ? (
          <Chip
            style={{ borderRadius: 5 }}
            variant="default"
            size="medium"
            title="Modified"
            label={`Similarity Score: ${similarityScore} % (Modified)`}
          />
        ) : (
          <Chip
            label={`Similarity Score: ${similarityScore} %`}
            style={{ borderRadius: 5 }}
            variant="default"
            size="medium"
          />
        )}
      </Grid>
    </Grid>
  );
}

function Authors({ authorsList }) {
  const res = [];
  authorsList.forEach((element) => {
    res.push(element.name);
  });
  return (
    <Typography noWrap gutterBottom variant="subtitle2">
      {res.join(" , ")}
    </Typography>
  );
}

function PaperAbstract({ paper }) {
  let modified_text = HighlightText(
    paper.paperId,
    paper.keywords_similarity,
    paper.abstract
  );

  return (
    <Typography
      variant="body1"
      align="justify"
      sx={{ padding: "0px 15px" }}
      dangerouslySetInnerHTML={{ __html: modified_text }}
    />
  );
}

export default function PaperContent({ paper }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [popoverActive, setPopoverActive] = React.useState(false);
  const [modalActive, setModalActive] = React.useState(true);
  const [menu, setMenu] = useState(null);
  const handleClick = (event) => {
    let ele = anchorEl && anchorEl.element;
    if (event.currentTarget === ele) {
      setAnchorEl(null);
      return;
    }
    let dataTip = event.currentTarget.getAttribute("data-tip");
    if (!dataTip) return;
    let keyword = decodeURIComponent(escape(atob(dataTip)));
    let interests = paper.keywords_similarity[keyword];
    setAnchorEl({ element: event.currentTarget, interests: interests });
  };

  const popoverActiveHandleChange = (event) => {
    setPopoverActive(event.target.checked);
  };

  const modalActiveHandleChange = (event) => {
    setModalActive(event.target.checked);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? paper.paperId : undefined;

  useEffect(() => {
    ReactTooltip.rebuild();
    document
      .querySelectorAll(`a[data-tip][aria-describedby="${paper.paperId}"]`)
      .forEach((ele, i) => {
        if (ele.previousHandleClick)
          ele.removeEventListener("click", ele.previousHandleClick);
        ele.addEventListener("click", handleClick);
        ele.previousHandleClick = handleClick;
      });
  });

  return (
    <>
      {/* {(false?(<>
      <Switch
        checked={popoverActive}
        onChange={popoverActiveHandleChange}
        inputProps={{ "aria-label": "Switch between tooltip and popover" }}
      />{" "} */}
      {/* {popoverActive ? (
        <>
          Popover{" "}
          <Switch
            checked={modalActive}
            onChange={modalActiveHandleChange}
            inputProps={{
              "aria-label": "Switch between Popover Modal and none-Modal",
            }}
          />{" "}
          {modalActive ? " With Backdrop" : "Without Backdrop"}
        </>
      ) : (
        "Tooltip"
      )} 
        </>): "")
}*/}
      {/* {!popoverActive ? (
        <ReactTooltip
          id={paper.paperId}
          event={"click"}
          globalEventOff={"click"}
          border={true}
          type={"light"}
          place={"bottom"}
          effect={"solid"}
          clickable={true}
          getContent={(dataTip) => {
            if (!dataTip) return <>No Data!</>;
            let keyword = decodeURIComponent(escape(atob(dataTip)));
            let interests = paper.keywords_similarity[keyword];
            return (
              <TopSimilarityChart
                onClick={(e) => e.stopPropagation()}
                interests={interests}
              />
            );
          }}
        />
      ) : (
        // <>
        //     <Menu anchorEl={anchorEl} open={Boolean(anchorEl)}
        //         onClose={handleClose}
        //         >
        //         <MenuItem>
        //         {(anchorEl ?<TopSimilarityChart  interests={anchorEl?.interests} />:<>No Data!</>)}
        //         </MenuItem>
        //     </Menu>
        // </>
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl && anchorEl.element}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
          sx={{ width: 350 }}
          {...(!modalActive
            ? {
                keepMounted: true,
                hideBackdrop: true,
                TransitionProps: {
                  unmountOnExit: true,
                },
              }
            : {})}
          //event={'click'}
          // globalEventOff={'click'} border={true}
          // type={'light'} place={'bottom'}
          // effect={'solid'} clickable={true} getContent={(dataTip) => {
          //         if(!dataTip) return <>No Data!</>;
          //         let keyword=decodeURIComponent(escape(atob(dataTip)));
          //         let interests=paper.keywords_similarity[keyword];
          //         return <TopSimilarityChart onClick={e => e.stopPropagation()} interests={interests} keyword={keyword} />;
          //     }}
        >
          {anchorEl ? (
            <TopSimilarityChart interests={anchorEl?.interests} />
          ) : (
            <>No Data!</>
          )}
        </Popover>
      )} */}
      <Title paper={paper} similarityScore={paper.score} />
      <PaperAbstract paper={paper} />
    </>
  );
}

//---------------Hoda end-----------------