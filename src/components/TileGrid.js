
import React from "react";
import { Link } from "react-router-dom";
import { activities } from "../activities";

export default function TileGrid() {
  return <ul className="activityGrid">
    {activities.map(({id, name, icon}, index) => <li key={id}>
      <Link className="activityTile" to={"/?id=" + id}>
        <img src={process.env.PUBLIC_URL + "/previews/" + id + ".jpg"} width="720" height="360"
          alt="" loading={index < 4 ? undefined : "lazy"} decoding="async" />
        <span className="tileLabel"><span className="tileIcon" aria-hidden="true">{icon}</span>{name}</span>
      </Link>
    </li>)}
  </ul>;
}
