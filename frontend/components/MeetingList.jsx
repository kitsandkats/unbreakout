import React from 'react';
import {post} from 'utils/api';


function Meeting(props) {
  const {topic, start_time} = props;
  const handleSubmit = event => {
    event.preventDefault();
    let data = {
      meeting_id: props.id,
    }
    post('/create', data).then(meeting => {
      if (meeting.code == '201'){
        window.location = meeting.url;
      }
    });
  }
  return (
    <div className="meeting-form">
      <h2>{topic}</h2>
      <p>{new Date(start_time).toLocaleString()}</p>
      <form onSubmit={handleSubmit} >
        <button className="btn btn-primary">Go</button>
      </form>
    </div>
  );
}

export default class MeetingList extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      items: []
    };
  }
  componentDidMount() {
    fetch("/zoom/meetings")
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            isLoaded: true,
            items: result.meetings
          });
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
  }

  render(){
    const {first_name, last_name} = this.props.zoomUser;
    return (
      <div className="container-md">
        <div className="row">
          <div className="col-md-6 offset-md-3">
            <p>hello {first_name} {last_name}</p>
            { this.state.items.map( (meeting) => <Meeting key={meeting.id} {...meeting} />) }
          </div>
        </div>
      </div>
    );
  }
}
