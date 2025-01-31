import { Tables } from "./supabase";

export type CommunityType = {
  boardId: string;
  boardTitle: string;
  date: string;
  likeList: string[];
  userInfo: {
    nickname: string;
    userImage: string;
  };
  musicInfo: {
    thumbnail: string;
  };
};

export type MusicInfoType = {
  artist: string;
  musicId: string;
  musicSource: string;
  musicTitle: string;
  release: string;
  thumbnail: string;
};
