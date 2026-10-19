import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useLanguage } from "../../context/LanguageContext";
import { fetchShops } from "../../utils/fetchShops";
import styles from "./Shops.module.css";

const getDistanceKm = (lat1, lng1, lat2, lng2) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const formatDistance = (km, unit) =>
  km < 10 ? `${km.toFixed(1)} ${unit}` : `${Math.round(km)} ${unit}`;

const pinSvg = (color) => `
  <svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 0C7.2 0 0 7 0 15.7 0 27 16 42 16 42s16-15 16-26.3C32 7 24.8 0 16 0z" fill="${color}"/>
    <circle cx="16" cy="15.5" r="6" fill="#fff"/>
  </svg>`;

const makeIcon = (color) =>
  L.divIcon({
    html: pinSvg(color),
    className: styles.pin,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
  });

const defaultIcon = makeIcon("#4c9a2a");
const activeIcon = makeIcon("#0b4a2c");
const userIcon = L.divIcon({
  html: `<span class="${styles.userDot}"></span>`,
  className: styles.pin,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const MapController = ({ selected, visibleShops }) => {
  const map = useMap();
  useEffect(() => {
    if (selected) {
      map.flyTo([selected.lat, selected.lng], 16, { duration: 1.2 });
    }
  }, [selected, map]);
  useEffect(() => {
    if (selected || visibleShops.length === 0) return;
    if (visibleShops.length === 1) {
      map.flyTo([visibleShops[0].lat, visibleShops[0].lng], 14, {
        duration: 1,
      });
      return;
    }
    const bounds = L.latLngBounds(visibleShops.map((s) => [s.lat, s.lng]));
    map.flyToBounds(bounds, { padding: [60, 60], duration: 1 });
  }, [visibleShops, selected, map]);

  return null;
};

const ICONS = {
  pin: (
    <>
      <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  arrow: <path d="M3 11l18-8-8 18-2-8-8-2z" />,
  map: (
    <>
      <path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z" />
      <path d="M9 4v14M15 6v14" />
    </>
  ),
  building: (
    <>
      <path d="M4 21V5l9-2v18M13 9h7v12M4 21h16" />
      <path d="M8 8h1M8 12h1M8 16h1M16 13h1M16 17h1" />
    </>
  ),
  sort: <path d="M7 4v16M7 20l-3-3M7 20l3-3M17 20V4M17 4l-3 3M17 4l3 3" />,
  crosshair: (
    <>
      <circle cx="12" cy="12" r="7" />
      <circle cx="12" cy="12" r="2" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    </>
  ),
  phone: (
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
  ),
  chevron: <path d="M6 9l6 6 6-6" />,
};

const Icon = ({ name, size = 18, filled = false, className }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {ICONS[name]}
  </svg>
);

const Shops = () => {
  const { t, lang } = useLanguage();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [userPos, setUserPos] = useState(null);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState("");
  const [city, setCity] = useState("all");
  const [sortOrder, setSortOrder] = useState("nearest");
  const [selectedId, setSelectedId] = useState(null);
  const itemRefs = useRef({});

  useEffect(() => {
    const controller = new AbortController();
    fetchShops(controller.signal)
      .then(setShops)
      .catch((err) => {
        if (err.name !== "AbortError") setLoadError(err.message);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const cities = useMemo(
    () =>
      [...new Set(shops.map((s) => s.city))].sort((a, b) =>
        a.localeCompare(b, lang),
      ),
    [shops, lang],
  );

  const visibleShops = useMemo(() => {
    let list = shops
      .filter((s) => city === "all" || s.city === city)
      .map((s) => ({
        ...s,
        distance: userPos
          ? getDistanceKm(userPos.lat, userPos.lng, s.lat, s.lng)
          : null,
      }));

    if (userPos) {
      list.sort((a, b) =>
        sortOrder === "nearest"
          ? a.distance - b.distance
          : b.distance - a.distance,
      );
    }
    return list;
  }, [shops, city, userPos, sortOrder]);

  const selected = visibleShops.find((s) => s.id === selectedId) || null;

  const handleLocate = () => {
    if (!navigator.geolocation) {
      setGeoError("shopsGeoUnsupported");
      return;
    }
    setLocating(true);
    setGeoError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setSortOrder("nearest");
        setLocating(false);
      },
      () => {
        setGeoError("shopsGeoFailed");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const askedRef = useRef(false);
  useEffect(() => {
    if (askedRef.current) return;
    askedRef.current = true;
    handleLocate();
  }, []);

  const handleCityChange = (e) => {
    setCity(e.target.value);
    setSelectedId(null);
  };

  const handleSelect = (id) => {
    setSelectedId(id);
    itemRefs.current[id]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  };

  return (
    <section className={styles.page}>
      <div className={styles.container}>
        <header className={styles.head}>
          <div>
            <h1 className={styles.title}>{t("shopsTitle")}</h1>
            <p className={styles.subtitle}>{t("shopsSubtitle")}</p>
          </div>
        </header>
        <div className={styles.layout}>
          <div className={styles.panel}>
            <div className={styles.controls}>
              <button
                type="button"
                className={styles.locateBtn}
                onClick={handleLocate}
                disabled={locating}
              >
                <Icon name="pin" size={20} filled />
                {locating
                  ? t("shopsLocating")
                  : userPos
                    ? t("shopsRelocate")
                    : t("shopsLocate")}
              </button>

              <label className={styles.selectWrap}>
                <Icon name="building" className={styles.selectIcon} />
                <select
                  className={styles.select}
                  value={city}
                  onChange={handleCityChange}
                  aria-label={t("shopsSelectCity")}
                >
                  <option value="all">{t("shopsAllCities")}</option>
                  {cities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <Icon
                  name="chevron"
                  size={16}
                  className={styles.selectChevron}
                />
              </label>

              <label
                className={`${styles.selectWrap} ${!userPos ? styles.selectDisabled : ""}`}
                title={!userPos ? t("shopsSortHint") : ""}
              >
                <Icon name="sort" className={styles.selectIcon} />
                <select
                  className={styles.select}
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  disabled={!userPos}
                  aria-label={t("shopsSort")}
                >
                  <option value="nearest">{t("shopsNearest")}</option>
                  <option value="farthest">{t("shopsFarthest")}</option>
                </select>
                <Icon
                  name="chevron"
                  size={16}
                  className={styles.selectChevron}
                />
              </label>
            </div>

            {geoError && <p className={styles.error}>{t(geoError)}</p>}

            <ul className={styles.list}>
              {loading && <li className={styles.empty}>{t("shopsLoading")}</li>}
              {loadError && (
                <li className={`${styles.empty} ${styles.error}`}>
                  {t("shopsLoadError")} {loadError}
                </li>
              )}
              {!loading && !loadError && visibleShops.length === 0 && (
                <li className={styles.empty}>{t("shopsNoShops")}</li>
              )}

              {visibleShops.map((shop) => (
                <li
                  key={shop.id}
                  ref={(el) => (itemRefs.current[shop.id] = el)}
                  className={`${styles.card} ${
                    shop.id === selectedId ? styles.cardActive : ""
                  }`}
                  onClick={() => handleSelect(shop.id)}
                >
                  <Icon
                    name="pin"
                    size={34}
                    filled
                    className={styles.cardPin}
                  />

                  <div className={styles.cardBody}>
                    <div className={styles.cardTop}>
                      <h3>{shop.name}</h3>
                      {shop.distance !== null && (
                        <span className={styles.distance}>
                          <Icon name="arrow" size={15} filled />
                          {formatDistance(shop.distance, t("shopsKm"))}
                        </span>
                      )}
                    </div>

                    <div className={styles.cardBottom}>
                      <div className={styles.metaList}>
                        {shop.address && (
                          <p className={styles.meta}>
                            <Icon name="pin" size={16} filled />
                            {shop.address}
                          </p>
                        )}
                        {shop.hours && (
                          <p className={styles.meta}>
                            <Icon name="clock" size={16} />
                            {shop.hours}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        className={styles.showBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(shop.id);
                        }}
                      >
                        <Icon name="map" size={18} />
                        {t("shopsShowOnMap")}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.mapWrap}>
            <MapContainer
              center={[40.4093, 49.8671]}
              zoom={11}
              scrollWheelZoom
              zoomControl={false}
              className={styles.map}
            >
              <TileLayer
                attribution={t("shopsMapAttribution")}
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <ZoomControl position="bottomright" />

              <MapController selected={selected} visibleShops={visibleShops} />

              {visibleShops.map((shop) => (
                <Marker
                  key={shop.id}
                  position={[shop.lat, shop.lng]}
                  icon={shop.id === selectedId ? activeIcon : defaultIcon}
                  eventHandlers={{ click: () => handleSelect(shop.id) }}
                />
              ))}

              {userPos && (
                <Marker position={[userPos.lat, userPos.lng]} icon={userIcon} />
              )}

              {selected && (
                <Popup
                  key={selected.id}
                  position={[selected.lat, selected.lng]}
                  offset={[0, -38]}
                  minWidth={260}
                  maxWidth={300}
                  closeButton
                >
                  <div className={styles.popup}>
                    <div className={styles.popupHead}>
                      <span className={styles.popupBadge}>
                        <Icon name="pin" size={20} filled />
                      </span>
                      <div className={styles.popupTitle}>
                        <strong>{selected.name}</strong>
                        {selected.city && <small>{selected.city}</small>}
                      </div>
                    </div>

                    <div className={styles.popupBody}>
                      {selected.address && (
                        <div className={styles.popupRow}>
                          <span className={styles.popupIco}>
                            <Icon name="pin" size={15} filled />
                          </span>
                          <span>{selected.address}</span>
                        </div>
                      )}
                      {selected.hours && (
                        <div className={styles.popupRow}>
                          <span className={styles.popupIco}>
                            <Icon name="clock" size={15} />
                          </span>
                          <span>{selected.hours}</span>
                        </div>
                      )}
                      {selected.phone && (
                        <a
                          className={`${styles.popupRow} ${styles.popupLink}`}
                          href={`tel:${selected.phone.replace(/\s/g, "")}`}
                        >
                          <span className={styles.popupIco}>
                            <Icon name="phone" size={15} />
                          </span>
                          <span>{selected.phone}</span>
                        </a>
                      )}

                      {selected.distance !== null && (
                        <div className={styles.popupFoot}>
                          <span>{t("shopsDistanceFromYou")}</span>
                          <span className={styles.popupDistance}>
                            <Icon name="arrow" size={13} filled />
                            {formatDistance(selected.distance, t("shopsKm"))}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Popup>
              )}
            </MapContainer>
          </div>
        </div>

        {!userPos && (
          <div className={styles.hint}>
            <span className={styles.hintTitle}>
              <Icon name="pin" size={34} filled />
              {t("shopsHintTitle")}
            </span>
            <span className={styles.hintText}>
              <Icon name="crosshair" size={26} />
              {t("shopsHintText")}
            </span>
          </div>
        )}
      </div>
    </section>
  );
};

export default Shops;
