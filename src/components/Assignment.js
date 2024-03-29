import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom'
import Cookies from 'js-cookie';
import Button from '@mui/material/Button';
import Radio from '@mui/material/Radio';
import {DataGrid} from '@mui/x-data-grid';
import {SERVER_URL} from '../constants.js'
import AddAssignment from './AddAssignment'

// NOTE:  for OAuth security, http request must have
//   credentials: 'include'
//

class Assignment extends React.Component {
    constructor(props) {
      super(props);
      this.state = {selected: 0, assignments: []};
      //the state of the web page auto selcts the assignment at row 0
    };

   componentDidMount() {
    this.fetchAssignments();
  }

  fetchAssignments = () => {
    console.log("Assignment.fetchAssignments");
    const token = Cookies.get('XSRF-TOKEN');
    fetch(`${SERVER_URL}/gradebook`,
      {
        method: 'GET',
        headers: { 'X-XSRF-TOKEN': token }
      } )
    .then((response) => response.json())
    .then((responseData) => {
      if (Array.isArray(responseData.assignments)) {
        //  add to each assignment an "id"  This is required by DataGrid  "id" is the row index in the data grid table
        this.setState({ assignments: responseData.assignments.map((assignment, index) => ( { id: index, ...assignment } )) });
      } else {
        toast.error("Fetch failed.", {
          position: toast.POSITION.BOTTOM_LEFT
        });
      }
    })
    .catch(err => console.error(err));
  }

   onRadioClick = (event) => {
    console.log("Assignment.onRadioClick " + event.target.value);
    this.setState({selected: event.target.value});
  }

addAssignments = (assignment) => {
   const token = Cookies.get('XSRF-TOKEN');
   fetch(`${SERVER_URL}/assignment`,
  {
    method:'POST',
    headers: {'Content-Type': 'application/json',
              'X-XSRF-TOKEN' : token  },
    body: JSON.stringify(assignment)
  })
.then(res => {
  if (res.ok) {
    toast.success("Course succesfully added", {
        position: toast.Position.BOTTOM_LEFT
    });
  this.fetchAssignments();
}
else{
  toast.error("error when adding" , {
    position: toast.Position.BOTTOM_LEFT
  });
  console.error('Post http status=' + res.status);
  }
})
.catch (err => {
  toast.error("error when adding" , {
        position: toast.Position.BOTTOM_LEFT
  });
  console.error(err);
  })
 }
  render() {
     const columns = [
      {
        field: 'name',
        headerName: 'Assignment',
        width: 400,
        //custom render displays assignment with a radio button
        renderCell: (params) => (
          <div>
          <Radio
            checked={params.row.id == this.state.selected}
            onChange={this.onRadioClick}
            value={params.row.id}
            color="default"
            size="small"
          />
          {params.value}
          </div>
        )
      },
      //second column
      { field: 'courseTitle', headerName: 'Course', width: 300 },
      //third column
      { field: 'dueDate', headerName: 'Due Date', width: 200 }
      ];

      const assignmentSelected = this.state.assignments[this.state.selected];
        //this is where add assignment button will be placed
      return (
          <div align="left" >
            <h4>Assignment(s) ready to grade: </h4>

              <div style={{ height: 450, width: '100%', align:"left"   }}>
                <DataGrid rows={this.state.assignments} columns={columns} />
              </div>
            <Button component={Link} to={{pathname:'/gradebook',   assignment: assignmentSelected }}
                    variant="outlined" color="primary" disabled={this.state.assignments.length===0}  style={{margin: 10}}>
              Grade
            </Button>
            <AddAssignment addAssignment= {this.addAssignments} />

            <ToastContainer autoClose={1500} />
          </div>
      )
  }
}

export default Assignment;
