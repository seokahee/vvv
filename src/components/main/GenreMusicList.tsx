"use client";

import { getMusicPreferenceData, getUserChar } from "@/shared/main/api";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import RecommendationMusicList from "./RecommendationMusicList";
import RandomMusicList from "./RandomMusicList";
import { useStore } from "@/shared/store";

const GenreMusicList = () => {
  const { userInfo } = useStore();

  const { data: userData } = useQuery({
    queryFn: () => getUserChar(userInfo.uid),
    queryKey: ["userChar"]
  });

  const { data: musicPreferenceData } = useQuery({
    queryFn: () => getMusicPreferenceData(userData?.userChar.mbti as number),
    queryKey: ["userMusicPreference", userData],
    enabled: typeof userData?.userChar?.mbti === "number"
  });

  return <>{musicPreferenceData ? <RecommendationMusicList musicPreferenceData={musicPreferenceData} /> : <RandomMusicList />}</>;
};

export default GenreMusicList;
