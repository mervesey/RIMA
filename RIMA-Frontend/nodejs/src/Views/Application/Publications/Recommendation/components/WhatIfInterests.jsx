/**
 * WhatIfInterests.jsx - The component of What-if interest explanation
 * User can adjust the interests to see waht would happen for a specific recommended item.
 * Changing the weights, add or remove the interests.
 * contains:
 * 1. interests' slider
 * 2. threshold slider
 * 3. compareble bar chart for interests
 * 4. compareble bar chart for similarity score
 */
import React, { useEffect, useState } from "react";
import {
  Grid,
  IconButton,
  FormControl,
  OutlinedInput,
  InputAdornment,
  Button,
  Slider,
  Divider,
} from "@material-ui/core";
import AddBoxIcon from "@material-ui/icons/AddBox";
import InterestSlider from "./Slider";
import { ComapaerableBarChart } from "./ComparableBarChart";
import RestAPI from "Services/api";

/**
 * @function WhatIfInteres
 * The component of What-if interest explanation
 * @param {Object} props paper(Object),interests(Object), index(String - paperId), threshold(Number)
 * @returns What-if interest component
 */
export const WhatIfInterests = (props) => {
  const [state, setState] = useState({
    paper: props.paper,
    interests: props.paper.interests || props.interests,
    index: props.index,
    threshold: props.threshold,
  });

  useEffect(() => {
    handleInterestsChange();
  }, [state.interests.length]);

  /**
   * To apply changes
   */
  const handleApplyInterestsChanges = () => {
    const newPaperProps = state.paper;
    newPaperProps.score = state.paper.new_score;
    newPaperProps.interests_similarity = state.paper.new_interests_similarity;
    newPaperProps.interests = state.interests;
    newPaperProps.threshold = state.threshold;
    newPaperProps.modified = true;
    setState({
      ...state,
      paper: newPaperProps,
    });
    props.handleApplyWhatIfChanges(state.index, newPaperProps);
  };

  /**
   * To delete an interest
   * @param {Int} index
   */
  const handleInterestDelete = (index) => {
    if (index > -1) {
      let interests = state.interests;
      delete state.paper.interests_similarity[interests[index].text];
      interests.splice(index, 1);
      setState({ ...state, interests });
    }
  };
  /**
   * To change the weight of an interest
   * @param {Int} index
   * @param {Number} newWeight
   */
  const changeInterestWeight = (index, newWeight) => {
    let myTags = state.interests;
    myTags[index].weight = newWeight;
    setState({
      ...state,
      interests: myTags,
    });
    handleInterestsChange();
  };
  /**
   * To add a new interest
   * @param {event} e
   */
  const handleNewInterest = (e) => {
    if (
      (e.key === "Enter" || e.type == "click") &&
      state.interests.length < 10
    ) {
      const interests = state.interests;
      const newInterest = document.getElementById(
        `newInterest_${state.index}`
      ).value;
      interests.push({
        _id: interests.length,
        text: newInterest,
        color: "#303F9F",
        weight: 2.5,
      });
      setState({
        ...state,
        interests,
      });
    }
  };

  /**
   * To get calculations after changing
   */
  const handleInterestsChange = () => {
    const params = {
      interests: state.interests,
      paper_keywords: state.paper.paper_keywords,
    };
    const paper = state.paper;
    RestAPI.getInterestsSimilarities(params)
      .then((res) => {
        paper.new_score = res.data.data.score;
        paper.new_interests_similarity = res.data.data.interests_similarity;
        setState({
          ...state,
          paper: paper,
        });
      })
      .catch((err) => console.error("Error Getting Papers:", err));
  };
  /**
   * To change the threshold
   * @param {event} event
   * @param {Int} threshold
   */
  const handleChangeThreshold = (event, threshold) => {
    if (typeof threshold === "number") {
      setState({ ...state, threshold });
    }
  };
  /**
   * To display the threshold value with percent
   * @param {Int} value
   * @returns
   */
  const valueLabelFormat = (value) => {
    let scaledValue = value;
    return `${scaledValue}%`;
  };

  /**
   * To display the interests control panel
   * @param {object} interests
   * @returns
   */
  const InterestControlPanel = ({ interests }) => {
    let res = [];
    interests.map((tag, index) =>
      res.push(
        <Grid
          item
          container
          xs={2}
          sm={3}
          md={2}
          style={{ padding: "3px" }}
          key={tag.text}
        >
          <InterestSlider
            key={tag.text}
            handleTagsChange={handleInterestsChange}
            changeTagWeight={changeInterestWeight}
            handleDelete={handleInterestDelete}
            name={tag.text}
            color={tag.color}
            weight={tag.weight}
            index={index}
          />
        </Grid>
      )
    );
    return (
      <Grid container>
        {res}
        {state.interests.length < 10 ? (
          <Grid item xs={2} sm={3} md={2}>
            <Grid
              item
              style={{
                paddingTop: "3px",
                paddingLeft: "5px",
                width: "100%",
                height: "100%",
              }}
            >
              <FormControl variant="outlined">
                <OutlinedInput
                  id={`newInterest_${state.index}`}
                  className={"outlined-new-interest"}
                  placeholder="New Interest..."
                  onKeyDown={handleNewInterest}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="add"
                        color={"primary"}
                        style={{ padding: "0px" }}
                        onClick={handleNewInterest}
                      >
                        <AddBoxIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  }
                  labelWidth={0}
                />
              </FormControl>
            </Grid>
          </Grid>
        ) : null}
      </Grid>
    );
  };
  return (
    <Grid container>
      <Grid container>
        <InterestControlPanel interests={state.interests} />
      </Grid>
      <Divider style={{ width: "100%", marginTop: "10px" }} />
      <Grid container style={{ justifyContent: "center", marginTop: "40px" }}>
        <Grid item md={3}>
          <span>Similarity Threshold:</span>
        </Grid>
        <Grid container spacing={2} alignItems="center" item md={9}>
          <Grid item>0%</Grid>
          <Grid item xs>
            <Slider
              md={6}
              value={state.threshold}
              defaultValue={state.threshold}
              min={0}
              step={5}
              max={100}
              marks
              getAriaValueText={valueLabelFormat}
              valueLabelFormat={valueLabelFormat}
              onChange={handleChangeThreshold}
              valueLabelDisplay="on"
            />
          </Grid>
          <Grid item>100%</Grid>
        </Grid>
      </Grid>
      <Divider style={{ width: "100%", marginTop: "10px" }} />

      <Grid item container md={12}>
        <ComapaerableBarChart
          paper={state.paper}
          interests={state.interests}
          threshold={state.threshold}
        />
      </Grid>
      <Grid container justify="flex-end" style={{ padding: 10 }}>
        <Button
          color="primary"
          variant="contained"
          onClick={handleApplyInterestsChanges}
        >
          Apply changes
        </Button>
      </Grid>
    </Grid>
  );
};