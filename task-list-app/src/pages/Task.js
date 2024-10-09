/* eslint-disable no-restricted-globals */
import { useQuery } from "@tanstack/react-query";
import { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Tooltip,
    IconButton,
    Typography,
    Button,
    CircularProgress,
} from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import axios from "axios";
import { useGlobalData } from '../context/GlobalDataProvider';
import AddTask from '../components/AddTask';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import UpdateTask from '../components/UpdateTask';
import DeleteTask from '../components/DeleteTask';
import LogoutIcon from '@mui/icons-material/Logout';
import secureLocalStorage from "react-secure-storage";
import { useNavigate } from "react-router-dom";

const Task = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const accessToken = JSON.parse(secureLocalStorage.getItem('accessToken'));
  const currentTasks = JSON.parse(secureLocalStorage.getItem('currentTasks')) || [];
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [taskLoad, setTaskLoad] = useState(false);
  const [snackBar, setSnackBar] = useState(false);
  const [isModalAddTaskOpen, setIsModalAddTaskOpen] = useState(false);
  const [isModalUpdateTaskOpen, setIsModalUpdateTaskOpen] = useState(false);
  const [isModalDeleteTaskOpen, setIsModalDeleteTaskOpen] = useState(false);
  const [taskId, setTaskId] = useState("");
  const [specificTask, setSpecificTask] = useState(null);
  const { taskData, setTaskData, apiResponse } =  useGlobalData();
  const baseUrl = process.env.REACT_APP_BACKEND_API_URL || 'http://localhost:3000';

   const handleChangePage = (event, newPage) => {
    setPage(newPage);
   };

  const addTaskCloseModal = () => {
    setIsModalAddTaskOpen(false);
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const updateTaskCloseModal = () => {
    setIsModalUpdateTaskOpen(false);
  }

  const closeDeleteModal = () => {
    setIsModalDeleteTaskOpen(false);
  }

  const { isLoading } = useQuery({
    queryKey: ["tasks"],
    enabled: !!accessToken && !taskLoad,
    retryDelay: 500,
    refetchOnWindowFocus: false,
    queryFn: () =>
        axios
            .get(`${baseUrl}/api/items`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
              })
            .then((res) => {
                setTaskLoad(true);
                setTaskData(res?.data?.item);
                secureLocalStorage.setItem('currentTasks', JSON.stringify(res?.data?.item))
                return res?.data;
            }).catch((e) => {
                console.error(e);
            }),
   
  });

  const getTask = async (taskId) => {
    await axios.get(`${baseUrl}/api/items/${taskId}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
      },)
        .then((res) => {
            if (res?.status === 200) {
                setIsModalUpdateTaskOpen(true);
                setSpecificTask(res?.data);
            }

            if ([401, 400].includes(res.status)) {
                secureLocalStorage.removeItem('accessToken');
                navigate('/');
            }
    })
  }

  const handleLogout = () => {
     axios.post(`${baseUrl}/api/logout`, {}, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    .then(res =>  {
        if (res?.status === 200) {
            secureLocalStorage.removeItem('accessToken');
            secureLocalStorage.removeItem('currentTasks');
            navigate('/');
        }

    }).catch(error => console.error('Error:', error));
  }

  const filteredTask = !snackBar && currentTasks?.length > 0 ? taskData?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : []; 
  const showTasks = filteredTask && filteredTask.length > 0 && !isLoading;

  return (
    <div className="flex flex-col">
        <Tooltip title='Logout' className="self-end" sx={{marginRight:"20px", marginTop:"10px"}}>
            <IconButton onClick={handleLogout}>
                <LogoutIcon color="primary" />
            </IconButton>
        </Tooltip>
        <div className='flex flex-col items-center justify-center h-screen relative'>
                {isModalAddTaskOpen && (
                    <AddTask
                        addTaskCloseModal={addTaskCloseModal}
                        setSnackBar={setSnackBar}
                    />
                )}

                {isModalUpdateTaskOpen && (
                    <UpdateTask
                        updateTaskCloseModal={updateTaskCloseModal}
                        specificTask={specificTask}
                        setSnackBar={setSnackBar} />
                )}

                {isModalDeleteTaskOpen && (
                    <DeleteTask
                        closeDeleteModal={closeDeleteModal}
                        taskId={taskId}
                        setSnackBar={setSnackBar} />
                )}

                {snackBar && (
                    <Snackbar
                        open={open}
                        autoHideDuration={5000}
                        onClose={() => setSnackBar(false)}
                        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    >
                        <MuiAlert
                            elevation={6}
                            variant="filled"
                            onClose={() => setSnackBar(false)}
                            severity="success"
                        >
                            {apiResponse}
                        </MuiAlert>
                    </Snackbar>
                )}

                {!isLoading && currentTasks?.length === 0 && (
                    <div className='flex flex-col justify-center items-center mt-20'>       
                    
                        <div className='flex justify-center items-center p-3 text-white'>
                                <Button
                                    size="large"
                                    variant='contained'
                                    sx={{
                                        borderRadius: '50px',
                                        width:"300px"
                                    }}
                                    onClick={() => setIsModalAddTaskOpen(true)}
                                >
                                    Add Task
                                </Button>
                        </div>  
                    </div>
                )}

                <div className='flex flex-col gap-6'>
                    {showTasks && currentTasks?.length > 0 && !snackBar ? (
                        <>
                             <div className="self-end">
                                <Button
                                    variant='contained'
                                    sx={{
                                        borderRadius: '50px',
                                    }}
                                    onClick={() => setIsModalAddTaskOpen(true)}
                                >
                                    Add Task
                                </Button>
                             </div>
                            <Typography variant='h5'>Task List</Typography>
                            <TableContainer>
                                <Table className="table-auto border-collapse border border-gray-400 w-full">
                                    <TableHead>
                                        <TableRow className="bg-gray-100">
                                            <TableCell className="border border-gray-300 px-4 py-2">Task Name</TableCell>
                                            <TableCell className="border border-gray-300 px-4 py-2">Task Description</TableCell>
                                            <TableCell className="border border-gray-300 px-4 py-2">Action</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredTask?.map((task, index) => (
                                            <TableRow key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                                                <TableCell className="border border-gray-300 px-4 py-2">{task.name}</TableCell>
                                                <TableCell className="border border-gray-300 px-4 py-2">{task.description}</TableCell>
                                                <TableCell className="border border-gray-300 px-4 py-2">
                                                    <Tooltip title='Edit'>
                                                        <IconButton onClick={() => getTask(task?._id)}>
                                                            <EditIcon color='primary' />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title='Delete'>
                                                        <IconButton onClick={() => {
                                                            setIsModalDeleteTaskOpen(true);
                                                            setTaskId(task?._id);
                                                        } }>
                                                            <DeleteIcon color='error' />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25]}
                                component="div"
                                count={taskData.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage} />
                        </>
                    ): currentTasks?.length > 0  && <CircularProgress />}
                </div>
            </div>
         </div>
    )
}

export default Task;