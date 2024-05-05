import React, { useEffect, useState, useRef } from 'react';
import { MDBInput, MDBBtn } from 'mdb-react-ui-kit';

import 'w3-css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'mdb-react-ui-kit/dist/css/mdb.min.css';


// Відео
const cameras = {
    "Caddx Ratel 2 V2": {
        "Тип": "Аналогова",
        "Роздільна здатність": "1200 TVL",
        "Вага": 5.9
    },
    "RunCam Phoenix 2 SP": {
        "Тип": "Аналогова",
        "Роздільна здатність": "1500 TVL",
        "Вага": 7.5
    },
    "Caddx Nebula Pro Nano": {
        "Тип": "Цифрова",
        "Роздільна здатність": "720p/120 кадрів в секунду",
        "Вага": 3.5
    }
};

const vtxs = {
    "AKK FX2 Ultimate": {
        "Тип": "Аналогова",
        "Вихідна потужність": "25/200/500/800/1200mW",
        "Частота": 5.8,
        "Вага": 9.6
    },
    "TBS UNIFY PRO32 HV (MMCX)": {
        "Тип": "Аналогова",
        "Вихідна потужність": "14 дБм (25 мВт), 20 дБм (100 мВт), 26 дБм (400 мВт), 30 дБм + (1000 мВт +)",
        "Частота": 5.8,
        "Формат відео": "NTSC / PAL",
        "Вага": 8.7
    }
}

const video_systems = {
    "Caddx Polar Vista": {
        "Тип": "Цифрова",
        "Частота": 5.8,
        "Вага": 35.0
    }
}

// Польотні контроллери / Стек
const turn_regulators = {
    "T-Motor F55A Pro II ESC": {
        "Тип": "4",
        "Робоча напруга": "10.0-27.0 В",
        "Максимальний струм": 55,
        "Вага": 18.5
    },
    "T-Motor F35A 3-6S BLHeli-32": {
        "Тип": "Одинарний",
        "Робоча напруга": "11.1-22.2 В",
        "Максимальний струм": 35,
        "Вага": 8.1
    },
    "HOBBYWING XRotor 40A OPTO 2-6S": {
        "Тип": "Одинарний",
        "Робоча напруга": "7.4-22.2 В",
        "Максимальний струм": 60,
        "Вага": 26.0
    },
    "SPEEDYBEE BLS 50A 30X30 4В1 ESC": {
        "Тип": "4",
        "Робоча напруга": "16.8-25.2 В",
        "Максимальний струм": 66,
        "Вага": 14.0
    }
}

const flight_controllers = {
    "SpeedyBee F405 V3 BLS 50A": {
        "Максимальний струм": 55,
        "Робоча напруга": "7.0-22.0 В",
        "Процесор":	"STM32F722",
        "Вага": 9.0
    },
}

const flight_controller_aios = {
    "SpeedyBee F405 V3 BLS 50A": {
        "Максимальний струм": 60,
        "Робоча напруга": "11.1-22.2 В",
        "Вага": 23.4,
        "Буззер": true
    },
    "Hobbyporter F405+65A": {
        "Максимальний струм": 65,
        "Робоча напруга": "7.4-22.2 В",
        "Вага": 20.5,
        "Буззер": false
    },
}

// Матеріальні компоненти
const propellers = {
    "HQProp 7x4x3 полікарбонат": {
        "Діаметр пропелера": "7 дюймів",
        "Крок": 4,
        "Лопаті": 3,
        "Матеріал": "полікарбонат",
        "Діаметр маточини": "13.5 мм",
        "Товщина маточини": "7 мм",
        "Вал": "M5",
        "Вага": 9.1
    }
}

const motors = {
    "T-Motor F40 Pro II 2400KV": {
        "Максимальний струм": 49.62,
        "Робоча напруга": "11.1-14.8 В",
        "Вага": 27.5
    },
    "Emax ECO II 2807 1300KV": {
        "Максимальний струм": 50.0,
        "Робоча напруга": "11.1-22.2 В",
        "Вага": 47.6
    }
}

const batteries = {
    "Energy Life Li-Ion 6S2P горизонтальна 21700-P42A 12AWG XT60-F": {
        "Мінімальна напруга": 19.2,
        "Максимальна напруга": 25.2,
        "Номінальна напруга": "21,6 В",
        "Ємність": "8400 мА·год",
        "Конфігурація": "6S2P",
        "Хімія": "Li-Ion",
        "Конектор": "XT60-F",
        "Номінальний струм": 60.0,
        "Піковий струм": 90.0
    }
}

// Зв'язок
const receivers = {
    "TBS Crossfire Nano RX (SE)": {
        "Протокол зв'язку": "CROSSFIRE",
        "Робоча частота": "868 MHz, 915 MHz",
        "Робоча напруга": "3.3-8.4 В",
        "Вага": 0.5
    },
    "915MHz HappyModel ELRS ES900RX": {
        "Протокол зв'язку": "ELRS",
        "Робоча частота": "915 МГц",
        "Робоча напруга": "4.5-5.0 В",
        "Вага": 1.5
    },
    "FrSky RX8R-PRO 2.4 ГГц": {
        "Протокол зв'язку": "ACCST D8 | ACCST D16",
        "Робоча частота": "2450 МГц",
        "Робоча напруга": "3.5-10.0 В",
        "Вага": 14.8
    }
}

const antennas = {
    "RushFPV Cherry 5.8GHz SMA 160mm": {
        "Довжина": 160,
        "Частота": "5.8 ГГц",
        "Вага": 11.5
    },
    "ELRS GEPRC 915 мГц": {
        "Довжина": 75,
        "Частота": "915 МГц",
        "Вага": 2.6
    }
}

export const KitsCompare = (props) => {
    const [category, setCategory] = useState(null);

    const [camera, setCamera] = useState(null);
    const [VTX, setVTX] = useState(null);
    const [videoSystem, setVideoSystem] = useState(null);
    const [turnRegulator, setturnRegulator] = useState(null);

    const handleCameraChange = () => {

    }

    const handleVTXChange = () => {

    }

    const handleVideoSystemChange = () => {

    }

    const handleTurnRegulatorChange = () => {

    }

    const handleFlightControllerChange = () => {

    }

    const handleFlightControllerAIOChange = () => {

    }

    const handleMotorChange = () => {

    }

    const handleReceiverChange = () => {

    }

    const handleAntennaChange = () => {

    }

    const handlePropellerChange = () => {

    }

    return (
        <div>
            <div style={{ width: "min-content", display: "flex", flexDirection: "row" }}>
                <div>
                    <span style={{ marginTop: "15px", fontSize: "30px" }} className="w3-bar-item main-title">Камера</span>
                    {Object.keys(cameras).map((cameraName, index) => (
                        <li key={index} className="w3-bar-item w3-button" style={{ paddingBottom: "2px", paddingTop: "2px", fontSize: "20px" }}>
                            <label className="custom-checkbox">
                                <input
                                    type="radio"
                                    name={cameraName}
                                    value={cameraName}
                                    onChange={() => handleCameraChange(cameraName)}
                                />
                                <span className="checkmark"></span>
                                <span className="label-text" style={{ fontSize: "20px" }}>{cameraName}</span>
                            </label>
                        </li>
                    ))}
                </div>
                
                <div>
                    <span style={{ marginTop: "15px", fontSize: "30px" }} className="w3-bar-item main-title">Відеопередавач (VTX)</span>
                    {Object.keys(vtxs).map((vtx, index) => (
                        <li key={index} className="w3-bar-item w3-button" style={{ paddingBottom: "2px", paddingTop: "2px", fontSize: "20px" }}>
                            <label className="custom-checkbox">
                                <input
                                    type="radio"
                                    name={vtx}
                                    value={vtx}
                                    onChange={() => handleVTXChange(vtx)}
                                />
                                <span className="checkmark"></span>
                                <span className="label-text" style={{ fontSize: "20px" }}>{vtx}</span>
                            </label>
                        </li>
                    ))}
                </div>
            
                <div style={{ width: "min-content" }}>
                    <span style={{ marginTop: "15px", fontSize: "30px" }} className="w3-bar-item main-title">Відеосистема</span>
                    {Object.keys(video_systems).map((video_system, index) => (
                        <li key={index} className="w3-bar-item w3-button" style={{ paddingBottom: "2px", paddingTop: "2px", fontSize: "20px" }}>
                            <label className="custom-checkbox">
                                <input
                                    type="radio"
                                    name={video_system}
                                    value={video_system}
                                    onChange={() => handleVideoSystemChange(video_system)}
                                />
                                <span className="checkmark"></span>
                                <span className="label-text" style={{ fontSize: "20px" }}>{video_system}</span>
                            </label>
                        </li>
                    ))}
                </div>
            </div>

            {/* /////////////////////////// */}

            <div style={{ paddingTop: "20px" }}>
                {Object.keys(turn_regulators).map((turn_regulator, index) => (
                    <li key={index} className="w3-bar-item w3-button" style={{ paddingBottom: "2px", paddingTop: "2px", fontSize: "15px" }}>
                        <label className="custom-checkbox">
                            <input
                                type="radio"
                                name={turn_regulator}
                                value={turn_regulator}
                                onChange={() => handleTurnRegulatorChange(turn_regulator)}
                            />
                            <span className="checkmark"></span>
                            <span className="label-text" style={{ fontSize: "15px" }}>{turn_regulator}</span>
                        </label>
                    </li>
                ))}

                {Object.keys(flight_controllers).map((flight_controller, index) => (
                    <li key={index} className="w3-bar-item w3-button" style={{ paddingBottom: "2px", paddingTop: "2px", fontSize: "15px" }}>
                        <label className="custom-checkbox">
                            <input
                                type="radio"
                                name={flight_controller}
                                value={flight_controller}
                                onChange={() => handleFlightControllerChange(flight_controller)}
                            />
                            <span className="checkmark"></span>
                            <span className="label-text" style={{ fontSize: "15px" }}>{flight_controller}</span>
                        </label>
                    </li>
                ))}
            </div>

            <div>
                {Object.keys(flight_controller_aios).map((flight_controller_aio, index) => (
                    <li key={index} className="w3-bar-item w3-button" style={{ paddingBottom: "2px", paddingTop: "2px", fontSize: "15px" }}>
                        <label className="custom-checkbox">
                            <input
                                type="radio"
                                name={flight_controller_aio}
                                value={flight_controller_aio}
                                onChange={() => handleFlightControllerAIOChange(flight_controller_aio)}
                            />
                            <span className="checkmark"></span>
                            <span className="label-text" style={{ fontSize: "15px" }}>{flight_controller_aio}</span>
                        </label>
                    </li>
                ))}
            </div>

            <div>
                {Object.keys(motors).map((motor, index) => (
                    <li key={index} className="w3-bar-item w3-button" style={{ paddingBottom: "2px", paddingTop: "2px", fontSize: "15px" }}>
                        <label className="custom-checkbox">
                            <input
                                type="radio"
                                name={motor}
                                value={motor}
                                onChange={() => handleMotorChange(motor)}
                            />
                            <span className="checkmark"></span>
                            <span className="label-text" style={{ fontSize: "15px" }}>{motor}</span>
                        </label>
                    </li>
                ))}
            </div>

            <div>
                {Object.keys(receivers).map((receiver, index) => (
                    <li key={index} className="w3-bar-item w3-button" style={{ paddingBottom: "2px", paddingTop: "2px", fontSize: "15px" }}>
                        <label className="custom-checkbox">
                            <input
                                type="radio"
                                name={receiver}
                                value={receiver}
                                onChange={() => handleReceiverChange(receiver)}
                            />
                            <span className="checkmark"></span>
                            <span className="label-text" style={{ fontSize: "15px" }}>{receiver}</span>
                        </label>
                    </li>
                ))}
            </div>

            <div>
                {Object.keys(antennas).map((antenna, index) => (
                    <li key={index} className="w3-bar-item w3-button" style={{ paddingBottom: "2px", paddingTop: "2px", fontSize: "15px" }}>
                        <label className="custom-checkbox">
                            <input
                                type="radio"
                                name={antenna}
                                value={antenna}
                                onChange={() => handleAntennaChange(antenna)}
                            />
                            <span className="checkmark"></span>
                            <span className="label-text" style={{ fontSize: "15px" }}>{antenna}</span>
                        </label>
                    </li>
                ))}
            </div>

            <div>
                {Object.keys(propellers).map((propeller, index) => (
                    <li key={index} className="w3-bar-item w3-button" style={{ paddingBottom: "2px", paddingTop: "2px", fontSize: "15px" }}>
                        <label className="custom-checkbox">
                            <input
                                type="radio"
                                name={propeller}
                                value={propeller}
                                onChange={() => handlePropellerChange(propeller)}
                            />
                            <span className="checkmark"></span>
                            <span className="label-text" style={{ fontSize: "15px" }}>{propeller}</span>
                        </label>
                    </li>
                ))}
            </div>

        </div>
    );
};
