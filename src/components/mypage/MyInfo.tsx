"use client";

import { updateMyMusicIds, getUserAndPlaylistData, getUserPlaylistMyMusicInfoData, updateNickname, uploadUserThumbnail } from "@/shared/mypage/api";
import { useStore } from "@/shared/store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import CheckboxItem from "./CheckboxItem";
import Modal from "./Modal";
import Link from "next/link";

const MyInfo = () => {
  const { userInfo } = useStore();

  const [checkedList, setCheckedList] = useState<string[]>([]);
  const [userImage, setUserImage] = useState("");

  const [isModal, setIsModal] = useState(false);
  const [nickname, setNickname] = useState("");
  const [checkText, setCheckText] = useState("");
  const nicknameRef = useRef(null);

  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryFn: () => getUserAndPlaylistData(userInfo.uid),
    queryKey: ["mypage", userInfo.uid],
    enabled: !!userInfo.uid
  });

  const { data: playlistMyData } = useQuery({
    queryFn: () => getUserPlaylistMyMusicInfoData(data?.playlistMy?.[0].myMusicIds as string[]),
    queryKey: ["myMusicIds", data?.playlistMy],
    enabled: !!data?.playlistMy?.length
  });

  const deleteMutation = useMutation({
    mutationFn: updateMyMusicIds,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mypage"] });
    }
  });

  const updateNicknameMutation = useMutation({
    mutationFn: updateNickname,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mypage"] });
    }
  });

  const updateUserThumbnailMutation = useMutation({
    mutationFn: uploadUserThumbnail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mypage"] });
    }
  });

  const onChangeCheckMusicHandler = (checked: boolean, id: string) => {
    if (checked) {
      setCheckedList((prev) => [...prev, id]);
    } else {
      const checkList = checkedList.filter((el) => el !== id);
      setCheckedList(checkList);
    }
  };

  const onClickDeleteHandler = () => {
    const myMusicIds = data?.playlistMy?.[0].myMusicIds as string[];
    const newData = myMusicIds.filter((el) => !checkedList.includes(el));

    deleteMutation.mutate({ userId: userInfo.uid, myMusicIds: newData });
    alert("삭제가 완료되었습니다.");
  };

  const onClickViewModalHandler = () => {
    setIsModal(true);
  };

  const onClickCloseModalHandler = () => {
    setIsModal(false);
    setNickname("");
    setCheckText("");
  };

  const onClickUpdateHandler = () => {
    if (!nickname.trim()) {
      setCheckText("닉네임을 입력해주세요");
      return;
    }
    updateNicknameMutation.mutate({ userId: userInfo.uid, nickname });
    alert("닉네임 변경이 완료되었습니다.");
    onClickCloseModalHandler();
  };

  const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nickname = e.target.value;
    setNickname(nickname);
  };

  const selectFileHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files![0] as File;
    console.log(file);
    if (window.confirm("선택한 이미지로 업로드를 진행할까요?")) {
      const data = await updateUserThumbnailMutation.mutateAsync({ userId: userInfo.uid, file });
      setUserImage(data?.[0].userImage as string);
      alert("업로드 완료!");
    }
  };

  useEffect(() => {
    if (data) {
      setUserImage(data?.userImage);
    }
  }, [data]);

  if (isError) {
    return <>에러발생</>;
  }

  if (isLoading) {
    return <>로딩중</>;
  }

  return (
    <section className="p-[40px]">
      <div>
        <div className="flex justify-between">
          <div>
            <input type="file" onChange={selectFileHandler} accept="image/*" />
            <figure className="w-[80px] h-[80px] flex overflow-hidden rounded-full bg-slate-200">
              {userImage && <Image src={userImage} width={80} height={80} alt={`${data?.nickname} 프로필 이미지`} priority={true} />}
            </figure>
          </div>
          <Link href="/personal-music">퍼스널 뮤직 진단 다시받기</Link>
        </div>
        <span className="cursor-pointer" onClick={onClickViewModalHandler}>
          {data?.nickname} &gt;
        </span>
        <p>
          팔로우 {data?.following.length} 팔로워 {data?.follower.length}
        </p>
        <p>
          {data?.userChar?.mbti}
          {data?.personalMusic?.resultSentence}
        </p>
      </div>
      <div className="mt-[5rem]">
        <h2>{data?.nickname}님의 플레이리스트</h2>
        <button type="button">전체 재생 하기</button>
        <div>
          <button type="button" onClick={onClickDeleteHandler}>
            삭제
          </button>
          <button type="button">{checkedList.length}곡 재생</button>
        </div>
        <ul className="list-none">
          {playlistMyData?.map((item) => {
            return (
              <li key={item.musicId}>
                <div>
                  <CheckboxItem checked={checkedList.includes(item.musicId)} id={item.musicId} onChangeCheckMusicHandler={(e) => onChangeCheckMusicHandler(e.target.checked, item.musicId)} />
                  <figure>
                    <Image src={item.thumbnail} width={56} height={56} alt={`${item.musicTitle} 앨범 이미지`} />
                  </figure>
                  <label htmlFor={item.musicId} className="flex flex-col">
                    {item.musicTitle}
                    <span>{item.artist}</span>
                  </label>
                </div>
                <span>재생시간..</span>
              </li>
            );
          })}
        </ul>
      </div>
      {isModal && (
        <Modal title={"닉네임 변경"} onClick={onClickCloseModalHandler}>
          <label>
            <input type="text" value={nickname} className="w-full" ref={nicknameRef} onChange={onChangeInput} placeholder="변경할 닉네임을 입력해주세요" />
          </label>
          <p className="h-5 text-sm text-red-500">{checkText}</p>
          <div className="mt-4 flex justify-between">
            <button type="button" onClick={onClickCloseModalHandler}>
              취소
            </button>
            <button type="button" onClick={onClickUpdateHandler}>
              변경
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
};

export default MyInfo;
