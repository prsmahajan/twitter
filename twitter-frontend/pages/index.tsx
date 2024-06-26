import React, { useCallback, useState } from "react";
import { BsBell, BsBookmark, BsEnvelope, BsTwitter } from "react-icons/bs";
import {
  BiHash,
  BiHomeCircle,
  BiImageAlt,
  BiImages,
  BiMoney,
  BiUser,
} from "react-icons/bi";
import { SlOptions } from "react-icons/sl";
import FeedCard from "@/components/FeedCard/feed";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { toast } from "react-hot-toast";
import { graphqlClient } from "@/clients/api";
import { verifyUserGoogleTokenQuery } from "../graphql/query/user";
import { useCurrentUser } from "@/hooks/user";
import { QueryClient, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useCreateTweet, useGetAllTweets } from "@/hooks/tweet";
import { Maybe, Tweet, User } from "@/gql/graphql";
import { getAllTweetsQuery } from "@/graphql/query/tweet";
import { GetServerSideProps } from "next";

interface TwitterSideButton {
  title: string;
  icon: React.ReactNode;
}

interface GetAllTweetsResponse {
  getAllTweets: Tweet[];
}

interface HomeProps {
  tweets?: Tweet[];
}

const sidebarMenuItems: TwitterSideButton[] = [
  {
    title: "Home",
    icon: <BiHomeCircle />,
  },
  {
    title: "Explore",
    icon: <BiHash />,
  },
  {
    title: "Notifications",
    icon: <BsBell />,
  },
  {
    title: "Messages",
    icon: <BsEnvelope />,
  },
  {
    title: "Bookmarks",
    icon: <BsBookmark />,
  },
  {
    title: "Twitter Blue",
    icon: <BiMoney />,
  },
  {
    title: "Profile",
    icon: <BiUser />,
  },
  {
    title: "More",
    icon: <SlOptions />,
  },
];

export default function Home(props: HomeProps) {
  const { user } = useCurrentUser();
  const { tweets = [] } = useGetAllTweets();
  const { mutate } = useCreateTweet();

  const queryClient = useQueryClient();

  const [content, setContent] = useState("");

  const handleSelectImage = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();
  }, []);

  const handleCreateTweet = useCallback(() => {
    mutate({
      content,
    });
  }, [content, mutate]);

  const handleImageSelect = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();
  }, []);

  const handleLoginWithGoogle = useCallback(
    async (cred: CredentialResponse) => {
      const googleToken = cred.credential;
      if (!googleToken) return toast.error(`Google token not found`);
      const { verifyGoogleToken }: any = await graphqlClient.request(
        verifyUserGoogleTokenQuery,
        { token: googleToken }
      );

      toast.success("Verified Success");

      if (verifyGoogleToken)
        window.localStorage.setItem("__twitter_token", verifyGoogleToken);

      await queryClient.invalidateQueries({ queryKey: ["curent-user"] });
    },
    [queryClient]
  );

  return (
    <div>
      <div className="grid grid-cols-12 max-h-full max-w-full px-36">
        <div className="pt-1 col-span-3 relative">
          <div className="text-3xl hover:bg-gray-600 p-4 transition-all h-fit w-fit rounded-full cursor-pointer">
            <BsTwitter />
          </div>
          <div className="mt-1 text-xl pr-4">
            <ul>
              {sidebarMenuItems.map((item) => (
                <li
                  key={item.title}
                  className="flex justify-start items-center gap-4 hover:bg-gray-800 rounded-full p-2 w-fit cursor-pointer mt-2"
                >
                  <span className="text-2xl pl-2">{item.icon}</span>
                  <span className="pr-2">{item.title}</span>
                </li>
              ))}
            </ul>
            <button className="bg-[#1d9bfa] p-2 rounded-full w-11/12 mt-4 text-md font-semibold">
              Post
            </button>
          </div>
          {user && (
            <div className="absolute bottom-5 flex gap-3 items-center bg-gray-800 px-3 py-2 rounded-full">
              {user && user.profileImageUrl && (
                <Image
                  className="rounded-full"
                  src={user?.profileImageUrl}
                  alt="user-image"
                  height={40}
                  width={40}
                />
              )}
              <div>
                <h3 className="text-xl">
                  {user.firstName} {user.lastName}
                </h3>
              </div>
            </div>
          )}
        </div>
        <div className="col-span-6 border-l border-r border-slate-700 h-screen overflow-scroll overflow-x-hidden no-scrollbar">
          <div>
            <div className="border border-r-0 border-l-0 border-b-0 border-gray-600 p-5 hover:bg-slate-900 transition-all cursor-pointer">
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-1">
                  {user?.profileImageUrl && (
                    <Image
                      className="rounded-full"
                      src={user.profileImageUrl}
                      alt="user-image"
                      height={50}
                      width={50}
                    />
                  )}
                </div>
                <div className="col-span-11">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full bg-transparent text-xl px-3 border-b border-slate-700"
                    placeholder="What's happening?"
                    rows={3}
                  ></textarea>
                  <div className="mt-2 flex justify-between items-center">
                    <BiImageAlt
                      onClick={handleSelectImage}
                      className="text-xl"
                    />
                    <button
                      onClick={handleCreateTweet}
                      className="bg-[#1d9bf0] font-semibold text-sm py-2 px-4 rounded-full"
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {Array.isArray(tweets) &&
          tweets.map((tweet: Tweet) =>
            tweet ? <FeedCard key={tweet?.id} data={tweet as Tweet} /> : null
          )}
        </div>
        <div className="col-span-3 p-5">
          {!user && (
            <div className="px-3 py-5 bg-slate-600 rounded-lg w-[250px]">
              <h1 className="my-1 font-bold text-2xl text-center">
                New to twitter
              </h1>
              <GoogleLogin onSuccess={handleLoginWithGoogle} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
//   const allTweets = await graphqlClient.request<GetAllTweetsResponse>(
//     getAllTweetsQuery
//   );
//   return {
//     props: {
//       tweets: allTweets?.getAllTweets as Tweet[],
//     },
//   };
// };