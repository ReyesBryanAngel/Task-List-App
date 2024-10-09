import HighlightOffRoundedIcon from "@mui/icons-material/HighlightOffRounded";
import { useGlobalData } from "../context/GlobalDataProvider";
import axios from "axios";
import { 
    Dialog,
    DialogContent,
    TextField,
    Button,
    IconButton,
} from "@mui/material";
import { useState } from 'react';
import secureLocalStorage from "react-secure-storage";
import { useNavigate } from "react-router-dom";
import { getTasks } from "../services/GetTasks";

const UpdateTask = ({ updateTaskCloseModal, specificTask, setSnackBar }) => {
    const navigate = useNavigate();
    const accessToken = JSON.parse(secureLocalStorage.getItem('accessToken'));
    const [task, setTask] = useState({
        name: specificTask?.item?.name,
        description: specificTask?.item?.description
    });
    const [errorMessage, setErrorMessage] = useState("");
    const { setTaskData, setApiResponse } =  useGlobalData();
    const baseUrl = process.env.REACT_APP_BACKEND_API_URL || 'http://localhost:3000';

    const handleUpdate = async (e) => {
        if (!task.name.trim() ||!task?.description.trim()) {
            e.preventDefault();
            setErrorMessage("Task Name and Description are required.");
            return;
        }

        const currentTasks = await getTasks(baseUrl, accessToken);
        await axios.put(`${baseUrl}/api/items/${specificTask?.item?._id}`, {
            name: task?.name,
            description: task?.description
        }, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
          }).then(res => {
            if (res.status === 200) {
                setTaskData({
                    name: task?.name,
                    description: task?.description
                });
                secureLocalStorage.setItem('currentTasks', JSON.stringify(currentTasks));
                setApiResponse(res?.data?.message);
                setTask("");
                updateTaskCloseModal();
                setSnackBar(true);
                setTimeout(() => {
                    window.location.reload();
                }, 1000)
            }

            if ([401, 400].includes(res.status)) {
                secureLocalStorage.setItem('accessToken', null);
                navigate('/');
            }
        }).catch(e => console.error(e))
    }

    const handleChange = (e) => {
        const { name, value } = e.target;

        setTask((prevTask) => ({
            ...prevTask,
            [name]: value
        }))
        setErrorMessage("");
    }

    return (
        <>
            <Dialog
                open={true}
                onClose={updateTaskCloseModal}
                maxWidth="md"
                fullWidth 
            >
                <DialogContent>
                    <div className='my-10'>
                        <IconButton
                            aria-label="close"
                            onClick={updateTaskCloseModal}
                            sx={{
                            position: "absolute",
                            right: 6,
                            top: 4,
                            color: (theme) => theme.palette.grey[500],
                            }}
                        >
                            <HighlightOffRoundedIcon />
                        </IconButton>
                            <div className=''>
                                <div className='mb-5'>
                                    <TextField
                                        type='text'
                                        name='name'
                                        size="medium"
                                        className='w-full'
                                        id="name"
                                        onChange={handleChange}
                                        value={task?.name}
                                        error={!!errorMessage && !task?.name.trim()}
                                        helperText={!!errorMessage && !task?.name.trim() ? "Task Name is required." : ""}
                                        variant="outlined" 
                                    />
                                </div>
                                <div className='mb-5'>
                                    <TextField
                                        type='text'
                                        name='description'
                                        size="small"
                                        className='w-full'
                                        id="description"
                                        onChange={handleChange}
                                        value={task?.description}
                                        error={!!errorMessage && !task?.description.trim()}
                                        helperText={!!errorMessage && !task?.description.trim() ? "Task Description is required." : ""}
                                        variant="outlined" 
                                        multiline
                                        rows={4}
                                        fullWidth
                                    />
                                </div> 
                            </div>  
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Button onClick={handleUpdate} variant="contained" type="submit">Update Task</Button>
                            </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default UpdateTask;