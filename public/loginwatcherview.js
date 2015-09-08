var users = ['bwb5381', 'csc6972', 'mds4680', 'hhc9231', 'cjh4066'];

var User = React.createClass({
  getInitialState: function() {
    return {
      fullname: '',
      id: '',
      badgenum: '',
      punches: []
    }
  },

  loadInfo: function() {
    var URL = "/user/" + this.props.user;
    var req = new XMLHttpRequest();
    console.log(this.props.user)
    req.onload = function(res) {
      var response = JSON.parse(res.target.responseText);
      this.setState(response);
    }.bind(this);
    req.open("get", URL, true);
    req.send();
  },

  componentDidMount: function() {
    this.loadInfo();
    setInterval (this.loadInfo, 50000);
  },

  signedIn: function() {
    var today = new Date().toISOString().slice(0,10);
    var si = false;
    _.forEach(this.state.punches, function(p, key) {
      // compensating for the missedpunch format weirdness
      if (today == p['applydate']) {
        if (p['endreason'] == "missedOut") {
          var timeIn = new Date(p['in_datetime']);
          var hours = new Date() - timeIn;
          si = new Date(hours);
        }
      }
    });
    return si;
  },

  hoursWorked: function() {
    var hours = 0;

    var today = new Date().toISOString().slice(0,10);
    _.forEach(this.state.punches, function(p, key) {
      // compensating for the missedpunch format weirdness
      var timeIn = new Date(p['in_datetime']);

      if ((today == p['applydate']) && (p['endreason'] == "missedOut")) {
        hours += new Date() - timeIn;
      } else {
        var timeOut = new Date(p['out_datetime']);
        hours += timeOut - timeIn;
      }
    });
    return new Date(hours);
  },

  render: function() {
    var level = '';
    if (this.signedIn()) {
      if (this.signedIn() - new Date("1970-01-01T05:30:00.491Z") > 0) {
        level = "warning";
      }
    }
    return (
        <tr className={level} key={this.props.user}>
          <td key="name"> {this.state.fullname} </td>
          <td key="user"> {this.props.user} </td>
          <td key="badgenum"> {this.state.badgenum} </td>
          <td key="signedin"> {this.signedIn() ? this.signedIn().toJSON().slice(11, 16) : "N/A"} </td>
          <td key="timeworked"> {this.hoursWorked().toJSON().slice(11, 16)} </td>
          </tr>
        )
  }
});

var Users = React.createClass({
  render: function() {
    return (
        <div id="main">
        <div class="table" >
          <table>
          <tr>
            <th>RIT ID</th>
            <th>NAME</th>
            <th>BADGENUM</th>
            <th>ACTIVE</th>
            <th>PAYPERIOD</th>
          </tr>
            {
              _.map(this.props.users, function(user, i) {
                return (
                    <User key={i} user={user} />)
              })
            }
            </table>
            </div>
        </div>);
  }
});

React.render(<Users users={_.clone(users, true)} />, document.getElementById('app'));
