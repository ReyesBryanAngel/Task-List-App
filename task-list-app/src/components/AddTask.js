import HighlightOffRoundedIcon from "@mui/icons-material/HighlightOffRounded";
import { useGlobalData } from "../context/GlobalDataProvider";
import axios from "axios";
import { 
    Dialog,
    DialogContent,
    TextField,
    Button,
    IconButton
} from "@mui/material";
import { useState } from 'react';
import secureLocalStorage from "react-secure-storage";
import { useNavigate } from "react-router-dom";
import { getTasks } from "../services/GetTasks";

const AddTask = ({ addTaskCloseModal, setSnackBar }) => {
    const navigate = useNavigate();
    const [taskName, setTaskName] = useState("");
    const accessToken = JSON.parse(secureLocalStorage.getItem('accessToken'));
    const [errorMessage, setErrorMessage] = useState("");
    const { setTaskData, setApiResponse } =  useGlobalData();
    const [taskDescription, setTaskDescription] = useState("");
    const baseUrl = process.env.REACT_APP_BACKEND_API_URL || 'http://localhost:3000';


    const handleSubmit = async (e) => {
        if (!taskName.trim() ||!taskDescription.trim()) {
            e.preventDefault();
            setErrorMessage("Task Name and Description are required.");
            return;
        }
        const currentTasks = await getTasks(baseUrl, accessToken);

        await axios.post(`${baseUrl}/api/items`, {
            name: taskName,
            description: taskDescription,
          }, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
          }).then(res => {
            if (res.status === 201) {
                setTaskData({
                    name: taskName,
                    description: taskDescription
                });
                secureLocalStorage.setItem('currentTasks', JSON.stringify(currentTasks));
                setApiResponse(res?.data?.message);
                setTaskName("");
                setTaskDescription("");
                addTaskCloseModal();
                setSnackBar(true);
                setTimeout(() => {
                    setSnackBar(false);
                    window.location.reload();
                }, 1000)
            }

            if ([401, 400].includes(res.status)) {
                secureLocalStorage.setItem('accessToken', null);
                navigate('/');
            }

        }).catch(e => console.error(e))
    }
    
    return (
        <>
            <Dialog
                open={true}
                onClose={addTaskCloseModal}
                maxWidth="md"
                fullWidth 
            >
                <DialogContent>
                    <div className='my-10'>
                        <IconButton
                            aria-label="close"
                            onClick={addTaskCloseModal}
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
                                    label="Task Name"
                                    id="name"
                                    onChange={(e) => {
                                        setTaskName(e.target.value)
                                        setErrorMessage("");
                                    }}
                                    value={taskName}
                                    error={!!errorMessage && !taskName.trim()}
                                    helperText={!!errorMessage && !taskName.trim() ? "Task Name is required." : ""}
                                    variant="outlined" 
                                />
                            </div>
                            <div className='mb-5'>
                                <TextField
                                    type='text'
                                    name='description'
                                    size="small"
                                    className='w-full'
                                    label="Task Description"
                                    id="description"
                                    onChange={(e) => {
                                        setTaskDescription(e.target.value)
                                        setErrorMessage("");
                                    }}
                                    value={taskDescription}
                                    error={!!errorMessage && !taskDescription.trim()}
                                    helperText={!!errorMessage && !taskDescription.trim() ? "Task Description is required." : ""}
                                    variant="outlined" 
                                    multiline
                                    rows={4}
                                    fullWidth
                                />
                            </div> 
                        </div>  
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button onClick={handleSubmit} variant="contained" type="submit">Submit</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default AddTask;