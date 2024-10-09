import HighlightOffRoundedIcon from "@mui/icons-material/HighlightOffRounded";
import { useGlobalData } from "../context/GlobalDataProvider";
import axios from "axios";
import { 
    Dialog,
    Button,
    IconButton,
    DialogContentText,
    Typography
} from "@mui/material";
import secureLocalStorage from "react-secure-storage";
import { useNavigate } from "react-router-dom";
import { getTasks } from "../services/GetTasks";

const DeleteTask = ({ closeDeleteModal, taskId, setSnackBar }) => {
    const navigate = useNavigate();
    const accessToken = JSON.parse(secureLocalStorage.getItem('accessToken'));
    const baseUrl = process.env.REACT_APP_BACKEND_API_URL || 'http://localhost:3000';
    const { setTaskData, setApiResponse } =  useGlobalData();

    const deleteTask = async (e) => {

        const currentTasks = await getTasks(baseUrl, accessToken);
        await axios.delete(`${baseUrl}/api/items/${taskId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
          },).then(res => {
            if (res.status === 200) {
                setTaskData((prevTaskData) => {
                    prevTaskData.filter(task => task?._id !== taskId);
                })
                secureLocalStorage.setItem('currentTasks', JSON.stringify(currentTasks));
                setApiResponse(res?.data?.message)
                closeDeleteModal();
                setSnackBar(true);
                setTimeout(() => {
                    window.location.reload();
                }, 1000)
            }

            if ([401, 400].includes(res.status)) {
                secureLocalStorage.removeItem('accessToken');
                navigate('/');
            }
        })
    }
    return (
        <Dialog onClose={closeDeleteModal} open={true}>
            <DialogContentText>
                <div className='flex flex-col justify-center items-center py-16 px-5 gap-10 relative'>
                    <div className='text-center mt-5'>
                        <Typography>
                            Are you sure you want to delete this task?
                        </Typography>
                    </div>
                    <div className='absolute right-2 top-2'>
                        <IconButton onClick={closeDeleteModal}>
                            <HighlightOffRoundedIcon/>
                        </IconButton>
                        
                    </div>
                    <div className='flex gap-10'>
                        <Button
                            onClick={closeDeleteModal}
                            variant="contained"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={deleteTask}
                            variant="contained"
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            </DialogContentText>
        </Dialog>
    )
}

export default DeleteTask;