import React, { useState, useEffect, useContext, memo } from "react";
import { Toggle } from "rsuite";
import PropTypes, { object } from "prop-types";
import { Check, Close } from "@rsuite/icons";

import { putRequest } from "../base/api-request";
import { showLoder } from "../reducers/actions";

import ContextApp from "../context/contextApp";
import { useParams } from "react-router-dom";
import NoData from "./NoData";

const ContainerInfoTop = ({ dataAray }) => {
  const { id } = useParams();

  const [currentValueToggleFist, setCurrentValueToggleFist] = useState(false);
  const [full, setFull] = useState(false);

  const { state, dispatch } = useContext(ContextApp);

  useEffect(() => {
    if (dataAray) {
      setCurrentValueToggleFist(+dataAray?.consolidation === 1 ? true : false);
      setFull(+dataAray?.full === 1 ? true : false);
    }
  }, [dataAray]);

  const downContainer = ({ full, consolidation }) => {
    dispatch(showLoder({ downContainer: 1 }));
    const params = {
      port_id: dataAray.port.id,
      number: dataAray.number,
      consolidation: consolidation,
      full: full,
      sea_line_id: dataAray.sea_line.id,
    };

    putRequest(`/api/v1/containers/${id}`, params)
      .then((res) => {
        state.createNotification("Контейнер консолидацирован!", "success");

        dispatch(showLoder({ downContainer: 0 }));
      })
      .catch((err) => {
        state.createNotification(err.message, "error");

        dispatch(showLoder({ downContainer: 0, status: err.status }));
      });
  };

  const generationLi = ({ sea_line, port, number, l_date }) => {
    const keyItem = [
      { "Reference No:": "-" },
      { "Loading status:": "-" },
      { "Shipping line:": sea_line ? sea_line.title : "-" },
      { "Port Of Load:": port ? port.name : "-" },
      { "Port Of Delivery:": "-" },
      { "Booking No:": "-" },
      { "Container No:": number ? number : "-" },
      { "Sail date:": l_date ? l_date : "-" },
      { "ETA:": "-" },
      { "Consigned To:": "-" },
    ];

    return keyItem.map((el) =>
      Object.entries(el).map((Chaild) => (
        <li key={Chaild[0]}>
          <p>{Chaild[0]}</p>
          <span>{Chaild[1]}</span>
        </li>
      ))
    );
  };

  const styleSheets = {
    li: {
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start",
    },
    Toggle: { width: "120px", marginLeft: "20px" },
  };
  const handleChecked = (val) => () => {
    if (Object.keys(val)?.at(-1) === "full") {
      setFull(val?.full);
      setCurrentValueToggleFist(val?.full ? false : true);
    } else if (Object.keys(val)?.at(-1) === "consolidation") {
      setFull(val?.consolidation ? false : true);
      setCurrentValueToggleFist(val?.consolidation);
    }

    return downContainer({
      full:
        Object.keys(val)?.at(-1) === "full" ? val?.full : !val?.consolidation,
      consolidation:
        Object.keys(val)?.at(-1) === "consolidation"
          ? val?.consolidation
          : !val?.full,
    });
  };

  return dataAray?.id ? (
    <ul className="customList">
      {generationLi(dataAray)}

      <li style={styleSheets.li}>
        <p>Полный контейнер:</p>

        <Toggle
          style={styleSheets.Toggle}
          checked={full}
          checkedChildren={<Check />}
          unCheckedChildren={<Close />}
          onChange={handleChecked({ full: !full })}
        />
      </li>
      <li style={styleSheets.li}>
        <p>Консолидированный контейнер:</p>

        <Toggle
          style={styleSheets.Toggle}
          checked={currentValueToggleFist}
          checkedChildren={<Check />}
          unCheckedChildren={<Close />}
          onChange={handleChecked({ consolidation: !currentValueToggleFist })}
        />
      </li>
    </ul>
  ) : (
    <NoData />
  );
};

ContainerInfoTop.propTypes = {
  dataAray: PropTypes.object,
};

export default memo(ContainerInfoTop);
