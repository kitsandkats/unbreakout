import React from 'react';
import { connect } from 'react-redux'

import MeetingList from 'components/MeetingList';
import ZoomAuth from 'components/ZoomAuth';
import Meeting from 'components/Meeting';
import MeetingRegistration from 'components/MeetingRegistration';

function App(props) {
  const {meeting, zoomUser, userRegistration} = props;
  if (meeting && (zoomUser || userRegistration)){
    return <Meeting {...props} />;
  }
  if (!zoomUser && !meeting){
    return <ZoomAuth {...props} />;
  }
  if (zoomUser && !meeting){
    return <MeetingList {...props} />;
  }
  if (meeting){
    return <MeetingRegistration {...props} />;
  }
}

const mapStateToProps = (state, ownProps) => {
  return {...state}
}


const Appa = connect(mapStateToProps, null)(App)
export default Appa;
