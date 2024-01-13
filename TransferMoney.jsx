import React, { useState, useContext, useMemo } from "react";

import ContextApp from "../context/contextApp";
import { postRequest, getRequest } from "../base/api-request";
import { showLoder } from "../reducers/actions";
import { dataInitTransfer } from "../const";
import { staticData } from "../configs/namesOfLinks";

import { Button, SelectPicker, InputNumber } from "rsuite";

const dataTypesWallets = staticData
  .find(({ id }) => id === "7")
  ?.children?.at(-1)
  ?.children?.filter(({ id }) => Object.keys(dataInitTransfer).includes(id));

const carrierArrayRss = (data) =>
  data?.map(({ title, name, id }) => ({
    label: title || name,
    value: id,
  }));

const carrierArrayRssWallet = (data) =>
  data?.map(({ role, name, id }) => {
    const res = [];

    if (role) {
      if (role?.second_name_ru) res.push(role.second_name_ru);
      if (role?.name_ru) res.push(role.name_ru);
      if (name) res.push(name);
    } else if (name) res.push(name);
    else res.push("USD");

    return {
      label: res.join(" "),
      value: id,
    };
  });

const variantRequest = (id) => {
  return {
    path: dataInitTransfer[id]?.reqPath + "?limit=500",
    nameKey: dataInitTransfer[id]?.nameKey,
    nameParams: dataInitTransfer[id]?.nameParams,
  };
};

const TransferMoney = () => {
  const [walletTypeFrom, setWalletTypeFrom] = useState("");
  const [walletFrom, setWalletFrom] = useState("");
  const [cashAccountFrom, setCashAccountFrom] = useState({});

  const [sum, setSum] = useState("");

  const [walletTypeTo, setWalletTypeTo] = useState("");
  const [walletTo, setWalletTo] = useState("");
  const [cashAccountTo, setCashAccountTo] = useState({});

  const { state, dispatch } = useContext(ContextApp);

  const reset = () => {
    setWalletTypeFrom("");
    setWalletFrom("");
    setCashAccountFrom({});

    setWalletTypeTo("");
    setWalletTo("");
    setCashAccountTo({});
  };

  const getWalletArrayFrom = (id) => {
    dispatch(showLoder({ money: 1 }));
    getRequest(`/api/v1/cash-account/${variantRequest(id)?.path}`, {
      Authorization: `Bearer ${window.sessionStorage.getItem("access_token")}`,
    })
      .then((res) => {
        dispatch(showLoder({ money: 0 }));
        setCashAccountFrom(res);
      })
      .catch((err) => {
        dispatch(showLoder({ money: 0, status: err.status }));
      });
  };

  const getWalletArrayTo = (id) => {
    dispatch(showLoder({ money: 1 }));
    getRequest(`/api/v1/cash-account/${variantRequest(id)?.path}`, {
      Authorization: `Bearer ${window.sessionStorage.getItem("access_token")}`,
    })
      .then((res) => {
        dispatch(showLoder({ money: 0 }));

        setCashAccountTo(res);
      })
      .catch((err) => {
        dispatch(showLoder({ money: 0, status: err.status }));
      });
  };

  const moneyTransfer = () => {
    dispatch(showLoder({ moneyTransfer: 1 }));
    const params = {
      target_wallet_type: variantRequest(walletTypeTo)?.nameParams,
      source_wallet_type: variantRequest(walletTypeFrom)?.nameParams,
      target_wallet_id: walletTo,
      source_wallet_id: walletFrom,
      sum,
    };

    postRequest("/api/v1/cryptos/replace-cash", params)
      .then(() => {
        state.createNotification("Успешно выполнено!", "info");
        dispatch(showLoder({ moneyTransfer: 0 }));
        reset();
      })
      .catch((err) => {
        dispatch(showLoder({ moneyTransfer: 0, status: err.status }));
        state.createNotification(
          err?.message ?? "Что-то пошло не так!",
          "error"
        );
      });
  };

  const styleSheets = {
    "top-item": {
      paddingLeft: state.width,
    },
    "bottom-itemFooter": { paddingLeft: state.width, color: "black" },
    select: { width: "30%" },
    button: {
      margin: "10px 0",
      background: "#03296b",
    },
    groupInput: {
      display: "flex",
      alignItems: "center",
    },

    buttonRight: { width: "100px", margin: "0 10px" },
  };

  const onChangeTypeFrom = (val) => {
    if (val) {
      const nameKey = variantRequest(val)?.nameKey;

      if (nameKey in cashAccountTo) setCashAccountFrom(cashAccountTo);
      else !(nameKey in cashAccountFrom) && getWalletArrayFrom(val);
    }
    setWalletFrom("");
    setWalletTypeFrom(val);
  };

  const onChangeTypeTo = (val) => {
    if (val) {
      const nameKey = variantRequest(val)?.nameKey;
      if (nameKey in cashAccountFrom) setCashAccountTo(cashAccountFrom);
      else !(nameKey in cashAccountTo) && getWalletArrayTo(val);
    }

    setWalletTo("");

    setWalletTypeTo(val);
  };
  const onChangeSum = (val) => {
    const prise = dataWalletTypeCashFrom?.split("$")[0];

    if (+val <= +prise && +val >= 0) setSum(+val);
  };

  const dataWalletFrom = useMemo(
    () =>
      carrierArrayRssWallet(
        cashAccountFrom[variantRequest(walletTypeFrom)?.nameKey]
      ),
    [cashAccountFrom, walletTypeFrom]
  );
  const dataWalletTypeCashFrom = useMemo(() => {
    const prise = cashAccountFrom[
      variantRequest(walletTypeFrom)?.nameKey
    ]?.find(({ id }) => id === walletFrom)?.cash;

    return (prise ? Number(prise)?.toFixed(2) : "0.00").concat(" $");
  }, [cashAccountFrom, walletTypeFrom, walletFrom]);

  const dataWalletTo = useMemo(
    () =>
      carrierArrayRssWallet(
        cashAccountTo[variantRequest(walletTypeTo)?.nameKey]
      ),
    [cashAccountTo, walletTypeTo]
  );
  const dataWalletTypeCashTo = useMemo(() => {
    const prise = cashAccountTo[variantRequest(walletTypeTo)?.nameKey]?.find(
      ({ id }) => id === walletTo
    )?.cash;

    return (prise ? Number(prise)?.toFixed(2) : "0.00").concat(" $");
  }, [cashAccountTo, walletTypeTo, walletTo]);

  const disabled = {
    loadingFrom: !cashAccountFrom?.length && !dataTypesWallets?.length,
    loadingTo: !cashAccountTo?.length && !dataTypesWallets?.length,
    submitBtn: !(
      walletTo &&
      walletFrom &&
      typeof sum === "number" &&
      dataWalletTo &&
      dataWalletFrom
    ),
  };

  return (
    <div className="itemContainer">
      <div className="itemContainer-inner">
        <div className="top-item" style={styleSheets["top-item"]}>
          <div className="btnTransport"></div>
        </div>
        <div
          className="bottom-itemFooter"
          style={styleSheets["bottom-itemFooter"]}
        >
          <div className="itemBrand">
            <label>Тип кошелька (откуда)</label>

            <SelectPicker
              style={styleSheets["select"]}
              data={carrierArrayRss(dataTypesWallets)}
              placeholder="Выберите тип кошелька"
              valueKey="value"
              labelKey="label"
              block
              onChange={onChangeTypeFrom}
              value={walletTypeFrom}
              searchable={false}
              loading={!dataTypesWallets?.length}
            />

            <label>Кошельки</label>
            <div style={styleSheets["groupInput"]}>
              <SelectPicker
                style={styleSheets["select"]}
                data={dataWalletFrom}
                placeholder="Выберите кошелек"
                valueKey="value"
                labelKey="label"
                block
                onChange={setWalletFrom}
                value={walletFrom}
                searchable={false}
                loading={disabled.loadingFrom}
                disabled={!!!walletTypeFrom}
              />
              <Button
                color="green"
                appearance="primary"
                disabled
                style={styleSheets["buttonRight"]}
              >
                {dataWalletTypeCashFrom}
              </Button>
            </div>

            <label>Сумма перевода</label>
            <InputNumber
              placeholder="Сумма перевода"
              style={styleSheets["select"]}
              value={sum}
              onChange={onChangeSum}
              max={+dataWalletTypeCashFrom}
            />

            <label>Тип кошелька (куда)</label>

            <SelectPicker
              style={styleSheets["select"]}
              data={carrierArrayRss(dataTypesWallets)}
              placeholder="Тип кошелька (куда)"
              valueKey="value"
              labelKey="label"
              block
              onChange={onChangeTypeTo}
              value={walletTypeTo}
              searchable={false}
              loading={!dataTypesWallets?.length}
            />

            <label>В кошелек</label>
            <div style={styleSheets["groupInput"]}>
              <SelectPicker
                style={styleSheets["select"]}
                data={dataWalletTo}
                placeholder="В кошелек"
                valueKey="value"
                labelKey="label"
                block
                onChange={setWalletTo}
                value={walletTo}
                searchable={false}
                loading={disabled.loadingTo}
                disabled={!!!walletTypeTo}
              />
              <Button
                color="green"
                appearance="primary"
                disabled
                style={styleSheets["buttonRight"]}
              >
                {dataWalletTypeCashTo}
              </Button>
            </div>

            <Button
              style={styleSheets["button"]}
              onClick={moneyTransfer}
              color="blue"
              appearance="primary"
              disabled={disabled.submitBtn}
            >
              Перенести
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default TransferMoney;
