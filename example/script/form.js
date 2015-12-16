/**
 * Form demo
 */
import React from "react";
import ReactDom from "react-dom";
import moment from "moment";
import DateInput from "../../src/component/form/DateInput.js";
let value = "2015-12-03";
function runner () {
    ReactDom.render(<div style={{
        position: "absolute",
        left: "1800px",
        top: "800px"
    }}><DateInput value={value} onChange={function (evt) {
        value = moment(evt.target.value).format("YYYY-MM-DD");
        runner();
    }} /></div>, document.getElementById("container"));
}
runner();
