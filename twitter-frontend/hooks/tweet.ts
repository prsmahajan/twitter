import { graphqlClient } from "@/clients/api";
import { CreateTweetData } from "@/gql/graphql";
import { createTweetMutation } from "@/graphql/mutation/tweet";
import { getAllTweetsQuery } from "@/graphql/query/tweet";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";


interface AllTweetsResponse {
  getAllTweets: {
    id: string;
    content: string;
    imageURL: string;
    author: {
      firstName: string;
      lastName: string;
      profileImageURL: string;
    };
  };
}

export const useCreateTweet = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationKey: ["create-tweet"],
    mutationFn: async (payload: CreateTweetData) => {
      await graphqlClient.request(createTweetMutation, { payload });
    },
    onMutate: () => toast.loading("Creating tweet...", { id: "1" }),
    onSuccess: async (payload) => {
      await queryClient.invalidateQueries({ queryKey: ["all-tweets"] });
            toast.success("Created-tweets!", { id: "1" });
  },
});

  return mutation;
};

export const useGetAllTweets = () => {
  const query = useQuery<AllTweetsResponse>({
    queryKey: ["all-tweets"],
    queryFn: () => graphqlClient.request(getAllTweetsQuery),
  });

  return { ...query, tweets: query.data?.getAllTweets };
};