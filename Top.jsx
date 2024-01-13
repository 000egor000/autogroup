import React, { useState, memo, useCallback, useContext } from "react";
import { Input } from "rsuite";
import PropTypes from "prop-types";
import { putRequest } from "../../base/api-request";
import { startDataEdit } from "../../const.js";
import { controlNumber } from "../../helper.js";
import ContextApp from "../../context/contextApp";
import { showLoder } from "../../reducers/actions";

const Top = ({
  autoInfo,
  getfields,
  dataFields,
  disabledUser,
  getBlockField,
  getUnBlockField,
  idProp,
  blockField,
}) => {
  const { dispatch } = useContext(ContextApp);

  const [editFields, setEditFields] = useState(startDataEdit);

  // Функция обновления поля
  const updateField = (val) => {
    dispatch(showLoder({ updateField: 1 }));
    const { name, value, id, type_payment, carrier } = val;

    const params = {
      field_id: id,
      type_payment_id: type_payment?.id ? type_payment?.id : null,
      carrier_id: carrier?.id ? carrier.id : null,
      name: name,
      value: value,
    };

    putRequest(`/api/v1/order/finance/field/${id}`, params)
      .then((res) => {
        getfields();

        dispatch(showLoder({ updateField: 0 }));
      })
      .catch((err) => {
        dispatch(showLoder({ updateField: 0, status: err.status }));
      });
  };

  const handleOnBlur = (val) => () => {
    getUnBlockField({
      field_id: val?.id,
      general_information_id: +idProp,
      user_id: JSON.parse(window.sessionStorage.getItem("user"))?.id,
    });

    updateField({
      ...editFields.initial,
      ...editFields.field,
    });

    setEditFields(startDataEdit);
  };

  const handleFocus = (val, key) => () => {
    getBlockField({
      field_id: val?.id,
      general_information_id: +idProp,
      user_id: JSON.parse(window.sessionStorage.getItem("user"))?.id,
    });

    setEditFields({
      initial: val,
      field: {
        [key]: typeof val[key] == "object" ? val[key]?.["id"] : val[key],
      },
    });
  };

  const handleOnChange = (key) => (val) => {
    setEditFields({
      ...editFields,
      field: {
        [key]: key === "value" ? controlNumber(val) : val,
      },
    });
  };

  const stateDisabled = (el) => {
    return (
      (!!el?.is_block && !!el?.invoice?.closed) ||
      !!el?.invoice?.closed ||
      ["office", "dealer"].includes(
        JSON.parse(window.sessionStorage.getItem("role")).code
      )
    );
  };

  const stateDisabledName = (el) =>
    !!el?.is_block ||
    !!el?.invoice?.closed ||
    ["office", "dealer"].includes(
      JSON.parse(window.sessionStorage.getItem("role")).code
    );
  const stateDisabledView = (el) =>
    (!Array.isArray(blockField) ? el?.block_field : disabledUser(el?.id)) ||
    ["office", "dealer"].includes(
      JSON.parse(window.sessionStorage.getItem("role")).code
    );

  const getValue = (init, value, key) =>
    Object.keys(value?.field)?.at(-1) === key ? value?.field[key] : init[key];

  const generationInvoice = useCallback(
    (elemMain) => {
      const initial = elemMain[1]?.invoice;

      const dataObject = {
        id: initial?.at(-1)?.invoice?.id,
        name: initial?.at(-1)?.type_info?.name,
        closed: initial?.at(-1)?.invoice?.closed,
        arrayData: initial,
        sum: initial?.at(-1)?.invoice?.sum,
      };

      return (
        elemMain && (
          <>
            <p>
              Cредства в кошельке (Дилер)
              <span>
                {autoInfo && autoInfo.cashAccountAuction
                  ? ` ${autoInfo.cashAccountAuction[0].plus_cash} $`
                  : `0 $`}
              </span>
            </p>
            <div className="payTitleTop">
              <p>{dataObject?.name}</p>
            </div>
            <div
              className="payBlockCustom"
              style={styleSheets["payBlockCustom"]}
            >
              {dataObject?.arrayData?.length > 0 &&
                dataObject.arrayData.map((el, i) => (
                  <ul style={styleSheets["ul"]} key={el.id}>
                    {editFields?.initial?.id === el.id ? (
                      // Состояние редактирования
                      <>
                        <li style={styleSheets["liName"]}>
                          {!!el.is_block ? (
                            <span>{el.name}</span>
                          ) : (
                            <Input
                              style={styleSheets["input"]()}
                              placeholder="Название поля"
                              value={getValue(el, editFields, "name")}
                              onChange={handleOnChange("name")}
                              disabled={
                                stateDisabledName(el) || stateDisabledView(el)
                              }
                              onBlur={handleOnBlur(el)}
                            />
                          )}
                        </li>

                        <li style={styleSheets["li"]}>
                          <Input
                            style={styleSheets["input"]()}
                            placeholder="Вводимое значение"
                            value={getValue(el, editFields, "value")}
                            onChange={handleOnChange("value")}
                            disabled={
                              stateDisabled(el) || stateDisabledView(el)
                            }
                            onBlur={handleOnBlur(el)}
                          />
                        </li>
                      </>
                    ) : (
                      // Состояние показа
                      <>
                        <li style={styleSheets["liName"]}>
                          {!!el.is_block ? (
                            <span>{el.name}</span>
                          ) : (
                            <Input
                              placeholder=""
                              value={el.name}
                              onFocus={handleFocus(el, "name")}
                              disabled={
                                stateDisabled(el) || stateDisabledView(el)
                              }
                              style={styleSheets["input"](el?.id)}
                            />
                          )}
                        </li>
                        <li style={styleSheets["li"]}>
                          <Input
                            style={styleSheets["input"](el?.id)}
                            placeholder=""
                            value={el.value}
                            onFocus={handleFocus(el, "value")}
                            disabled={
                              stateDisabled(el) || stateDisabledView(el)
                            }
                          />
                        </li>
                      </>
                    )}
                  </ul>
                ))}
            </div>
          </>
        )
      );
    },

    [dataFields, editFields, disabledUser]
  );

  const styleSheets = {
    li: { width: "25%", minWidth: "120px" },
    ul: {
      display: "flex",
      alignItems: "baseline",
      listStyle: "none",
      padding: 0,
      margin: 0,
    },
    liName: { width: "40%", minWidth: "120px" },
    payBlockCustom: {
      display: "flex",
      flexDirection: "column",
      textAlign: "start",
    },

    input: (val) => {
      const boxShadow = {
        boxShadow: !!val && disabledUser(val) ? "0 0 4px red" : "none",
      };
      const other = { width: "95%", maxWidth: "200px" };

      return !!val ? { ...boxShadow, ...other } : { ...other };
    },
    select: (val) => {
      return { boxShadow: !!val && disabledUser(val) ? "0 0 4px red" : "none" };
    },
  };

  return (
    <div className="dropBlockContent dropBlockContent--financeTop">
      <div className="topContent">
        {Object.entries(
          dataFields.length > 0 &&
            dataFields.reduce((acc, cur) => {
              acc[cur?.invoice?.type_info_id] = acc[
                cur?.invoice?.type_info_id
              ] || {
                type_info_id: cur?.invoice?.type_info_id,
                invoice: [],
              };

              acc[cur?.invoice?.type_info_id].invoice.push(cur);

              return acc;
            }, {})
        )
          .filter((el) => +el[0] === 1)
          .map((elemMain) => (
            <React.Fragment key={elemMain}>
              {generationInvoice(elemMain)}
            </React.Fragment>
          ))}
      </div>
    </div>
  );
};

Top.propTypes = {
  autoInfo: PropTypes.object,
  getfields: PropTypes.func,
  dataFields: PropTypes.array,
  disabledUser: PropTypes.func,
  getBlockField: PropTypes.func,
  getUnBlockField: PropTypes.func,
  idProp: PropTypes.string,
};

export default memo(Top);
