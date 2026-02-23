import Axios from "axios";

const axiosLocal = Axios.create({
  baseURL: "",
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosLocal;
