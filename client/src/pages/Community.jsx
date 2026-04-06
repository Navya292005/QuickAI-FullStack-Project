import { useAuth, useUser } from "@clerk/react";
import { useEffect, useState } from "react";
import { dummyPublishedCreationData } from "../assets/assets";
import { Heart } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const Community = () => {
  const [creations, setCreations] = useState([]);
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const { getToken } = useAuth();

  const fetchCreations = async () => {
    try {
      setLoading(true);

      const token = await getToken();

      const { data } = await axios.get(
        "/api/user/get-published-creations",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success && data.creations?.length > 0) {
        setCreations(data.creations);
      } else {
        // ✅ fallback to dummy data
        setCreations(dummyPublishedCreationData);
      }
    } catch (error) {
      console.log(error);
      toast.error("Using dummy data (API failed)");
      
      // ✅ fallback if API error
      setCreations(dummyPublishedCreationData);
    } finally {
      setLoading(false);
    }
  };

  const imageLikeToggle = async (id) => {
    try {
      const token = await getToken();

      const { data } = await axios.post(
        "/api/user/toggle-like-creation",
        { id },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success) {
        toast.success(data.message);
        fetchCreations();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCreations();
    } else {
      // ✅ show dummy if no user
      setCreations(dummyPublishedCreationData);
    }
  }, [user]);

  return !loading ? (
    <div className="flex-1 h-full flex flex-col gap-4 p-6">
      <h2 className="text-xl font-semibold">Creations</h2>

      <div className="bg-white h-full w-full rounded-xl overflow-y-scroll p-2 flex flex-wrap gap-4">
        {creations.length > 0 ? (
          creations.map((creation, index) => (
            <div
              key={creation.id || index}
              className="relative group w-full sm:w-[48%] lg:w-[30%]"
            >
              <img
                src={creation.content}
                alt="creation"
                className="w-full h-60 object-cover rounded-lg"
              />

              <div className="absolute inset-0 flex flex-col justify-end p-3 bg-black/0 group-hover:bg-black/70 transition rounded-lg">
                <p className="text-sm hidden group-hover:block text-white">
                  {creation.prompt}
                </p>

                <div className="flex gap-2 items-center text-white">
                  <p>{creation.likes?.length || 0}</p>

                  <Heart
                    onClick={() => imageLikeToggle(creation.id)}
                    className={`w-5 h-5 cursor-pointer ${
                      creation.likes?.includes(user?.id)
                        ? "fill-red-500 text-red-600"
                        : "text-white"
                    }`}
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center w-full">No creations found</p>
        )}
      </div>
    </div>
  ) : (
    <div className="flex justify-center items-center h-full">
      <span className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin"></span>
    </div>
  );
};

export default Community;