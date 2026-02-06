import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { getAuthHeader } from '../utils/auth';
import { restoreAuth, updateUserScore } from '../redux/slices/authSlice';

const API_STATUS = 'http://localhost:5000/api/prize-wheel/status';

export default function useUserState() {
  const dispatch = useDispatch();
  const { user, token, isLoggedIn } = useSelector((s) => s.auth);

  useEffect(() => {
    if (!isLoggedIn || !user) return;

    const refresh = async () => {
      try {
        const res = await axios.get(API_STATUS, { headers: getAuthHeader() });
        const d = res.data.data;
        if (d) {
          // update user score and anchors in Redux by reloading user object
          const newUser = { ...user, score: d.score ?? user.score, anchors: d.anchors ?? user.anchors };
          dispatch(restoreAuth({ user: newUser, token }));
        }
      } catch (err) {
        // ignore silently; token may be invalid
      }
    };

    refresh();
    // Periodically refresh every 5 minutes
    const id = setInterval(refresh, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [dispatch, isLoggedIn, user, token]);
}
