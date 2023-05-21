// Implemented By Abdallah
import React, {Component} from "react";
import Loader from "react-loader-spinner";
import Select from "react-select";
import {BASE_URL_CONFERENCE} from "../../../Services/constants";
import "d3-transition";
import {Button, Label, FormGroup, Form, Row, Col,} from "reactstrap";
import ReactApexChart from "react-apexcharts";
import "tippy.js/dist/tippy.css";
import "tippy.js/animations/scale.css";



class NewCompareAuthorsPapersCol extends Component {
  constructor(props) {
    super(props);
    this.selectInputRef = React.createRef();

    this.state = {
      mulitSelectDefaultValues : [{value: 'lak', label: 'lak'},{value: 'aied', label: 'aied'},{value: 'edm', label: 'edm'}],
      selectedConferences:["lak","aied","edm"],
      words:[
        {value: "data",       label: "data"},
        {value: "learning",     label: "learning"},
        {value: "model",     label: "model"},
        {value: "models",       label: "models"},
        {value: "online",       label: "online"},
        {value: "paper",      label: "paper"},
        {value: "student",       label: "student"},
        {value: "students",        label: "students"},
        {value: "system",      label: "system"},],
        selectedOption:"",
        weights : [],
        series: [
          {
            name : 'aied',
            data : [ 120, 339, 100, 291, 110, 203, 325, 282, 298, 80]
          },{
            name :'edm',
            data :[ 91, 159, 181, 252, 305, 212, 130, 168, 268, 100]
          },{
            name :'lak',
            data :[ 226, 180, 165, 236, 377, 418, 221, 218, 287, 250]
          }],
          options: {
            stroke: {
              curve: "smooth",
            },
            xaxis: {
              categories: ["1993", "2005", "2007", "2008", "2009", "2010", "2011", "2012", "2013", "2014", "2015", "2016", "2017", "2018", "2019", "2020", "2021"],
            },
          },
        
        };

        
      }
      wordhandleChange = (e) =>{
        console.log(e.value)
        this.setState({
          selectValue: e
        })
        console.log(this.state.selectValue)
    
    
      }
    
      conferenceshandleChange = (e) => {
        const value = Array.isArray(e) ? e.map((s) => s.value) : [];
    
        console.log("Abdo")
        console.log(value);
        console.log("Abdo")
    
    
        this.setState({
          selectConference: Array.isArray(e) ? e.map((s) => s.value) : [],
          selectedConferences: value,
        });
    
        console.log("BAB")
        console.log(this.state.selectedConferences);
        console.log("BAB")
      }
    
    
    
      selectSharedTopics = (e) => {
        this.setState({
          active1: true,
          active2: false,
          key: "topic",
        }, function() {
          this.clickEvent()
        });
      }
    
    
      selectSharedKeywords = (e) => {
        this.setState({
          active1: false,
          active2: true,
          key: "keyowrd",
        }, function() {
          this.clickEvent()
        });
      }
    
      handleToogle = (status) => {
        this.setState({imageTooltipOpen: status});
        console.log(this.state.imageTooltipOpen);
      };
    
      onClear = () => {
        this.setState({
          active1: false,
          active2: false,
          active3: false,
          active4: true,
          selectedConferences:[],
          years : [],
          selectValue : "",
          opacity: "0",
        });
    
        this.selectInputRef.current.select.clearValue();
    
      }
    
      clickEvent =() => {
        if (this.state.key == "topic"){
          var {series} = this.state;
          var {weights} =  this.state;
          fetch(
            BASE_URL_CONFERENCE +
            "AuthorsPapersEvolutio/topic/" + "?" + this.state.selectedConferences.join("&")  )
            .then((response) => response.json())
            .then((json) => {
              series = [];
              weights = [];
              for (let index = 0; index < this.state.selectedConferences.length; index++ ){
                for (let i = 0; i < json.weights.length; i++) {
                    weights[i] = json.weights[i][index]
                }
                    series = series.concat([
                    {name: this.state.selectedConferences[index], data: weights,}]);
                    weights = [];
                
            }
              this.setState({
                selectConference: this.state.selectedConferences,
                active1: true,
                active2: false,
                active3: true,
                active4: false,
                series: series,
                datalabels: {
                enabled: true,
                },
    
                options: {
                  ... this.state.options,
                  xaxis: {
                    ...this.state.options.xaxis,
                    categories: json.years,
                  }
                 },
                
                loader: false,
                opacity: "0.9",
              });
            });
        } else {
          var {series} = this.state;
          var {weights} =  this.state;    
          fetch(
            BASE_URL_CONFERENCE +
            "AuthorsPapersEvolutio/keyword/" +
            "?" +
            this.state.selectedConferences.join("&")  
          )
            .then((response) => response.json())
            .then((json) => {
            console.log(json);
            console.log("TEST 1]k");
              series = [];
              weights = [];
              console.log("TEST 1]kkk");
              for (let index = 0; index < this.state.selectedConferences.length; index++ ){
                for (let i = 0; i < json.weights.length; i++) {
                    weights[i] = json.weights[i][index]
                }
                    series = series.concat([
                    {name: this.state.selectedConferences[index], data: weights,}]);
    
                console.log("weights", weights);
                weights = [];
                
            }
              this.setState({
                selectConference: this.state.selectedConferences,
                active1: false,
                active2: true,
                active3: true,
                active4: false,
                series: series,
                datalabels: {
                enabled: true,
                },
                options: {
                  ... this.state.options,
                  xaxis: {
                    ...this.state.options.xaxis,
                    categories: json.years,
                  }
                 },
                loader: false,
                opacity: "0.9",
              });
            });
              
          
        }
      }

  render() {
      return (
        <div id="chart" className="box">
          <Form role="form" method="POST">
            <FormGroup>
              <br></br>
            <h2>Number of authors and publications evolution</h2>
              <p>
              The evolution of the number of authors and publications between conferences
              </p>

            <Label>Select conferences</Label>
          <Row>
            <div style={{width: "60%", marginLeft: "2%", marginRight: "4%",}}>
            <Select
                ref={this.selectInputRef}
                name="selectOptions"
                isClearable
                isMulti
                placeholder="Select Option"
                options={this.props.conferencesNames}
                value={this.props.conferencesNames.find((obj) => obj.value === this.state.selectConference)}
                onChange={this.conferenceshandleChange}
                defaultValue={this.state.mulitSelectDefaultValues}

            />
            </div>
              <Button
                outline
                color="primary"
                active={this.state.active1}
                value="topic"                
                onClick={this.selectSharedTopics}
              >
                Authors
              </Button>

              <Button
                outline
                color="primary"
                active={this.state.active2}
                value="key"                
                onClick={this.selectSharedKeywords}
              >
                publications
              </Button>
              {/* <i
                className="fas fa-question-circle text-blue"
                onMouseOver={() => this.handleToogle(true)}
                onMouseOut={() => this.handleToogle(false)}
              />
              {this.state.imageTooltipOpen && (
                <div
                  className="imgTooltip"
                  style={{
                    marginTop: "0px",
                    position: "relative",
                    left: "10px",
                    width: "400px",
                    color: "#8E8E8E",
                    border: "1px solid #BDBDBD",
                  }}
                >
                  <p>
                    {" "}
                    Hover over legend to highlight the evolution of specific conference the number of Authors/Papers over the years
                  </p>
                </div>
              )}
              <br/>
              {this.state.words.length == 0  && !this.state.active4 ? (
                <div style={{color: 'red'}}>No Authors/Papers found</div>

              ) : (<div/>)} */}

          </Row>
<              br/>

              
              {/* <Label>Select a topic/keyword</Label>
              <br/>
              <div style={{width: "250px"}}>
              <Select
                placeholder="Select conference"
                options={this.state.words}
                value={this.state.selectValue}
                onChange={this.wordhandleChange}
             /> 
                </div>
              <br/> */}
              
              {/* <Button
                outline
                active={this.state.active3}
                color="primary"
                onClick={this.clickEvent}
              >
                Compare
              </Button>
              <Button
                outline
                active={this.state.active4}
                color="primary"
                onClick={this.onClear}
              >
                Reset
              </Button> */}
              <div
                style={{
                  marginLeft: "300px",
                  marginTop: "100px",
                  position: "absolute",
                }}
              >
                {/* <div style={{backgroundColor: "white", display: this.state.display}}>
                  <Loader
                    type="Bars"
                    visible={this.state.loader}
                    color="#00BFFF"
                    height={100}
                    width={100}
                  />
                </div> */}
              </div>
            </FormGroup>
          </Form>
          <div style={{opacity: this.state.opacity}}>
            <ReactApexChart
              options={this.state.options}
              series={this.state.series}
              type="area"
              height={350}
            />
          </div>
        </div>
      );
    } 
}

export default NewCompareAuthorsPapersCol;
