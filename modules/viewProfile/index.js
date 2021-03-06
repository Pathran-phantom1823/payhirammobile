import React, { Component } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, TouchableHighlight, Dimensions } from 'react-native';
import { BasicStyles, Color, Routes } from 'common';
import UserImage from 'components/User/Image.js';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faStar, faCheckCircle, faUserCircle, faChevronLeft, faAddressCard } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular, faAddressCard as faAddressCardOutline, faSmile as empty } from '@fortawesome/free-regular-svg-icons';
import styles from './Style';
import Config from 'src/config';
import EducationalBackgroundCard from './EducationalBackgroundCard';
import PersonalInformationCard from './PersonalInformationCard';
import Button from 'components/Form/Button';
import { connect } from 'react-redux';
import { Rating } from 'components';
import Api from 'services/api/index.js';
import { Spinner } from 'components';

const height = Math.round(Dimensions.get('window').height);
class ViewProfile extends Component {

  constructor(props) {
    super(props);
    this.state = {
      educationalBackground: null,
      user: null,
      isLoading: false,
      connection: null,
      title: 'Send Request',
      status: false,
      connections: []
    };
  }
  componentDidMount() {
    this.retrieveAccount();
    this.retrieveConnections();
  }

  retrieveConnections() {
    let parameter = {
      condition: [{
        value: this.props.state.user.id,
        column: "account",
        clause: "="
      }, {
        value: this.props.state.user.id,
        column: "account_id",
        clause: "or"
      }]
    }
    Api.request(Routes.circleRetrieve, parameter, response => {
      this.setState({ connections: response.data })
      this.setState({status: true});
      if(response.data.length > 0) {
        this.checkStatus(response.data)
      }
    });
  }

  checkStatus = (array) => {
    const { user } = this.state
    array.map((item, index) => {
      if(item.id === user.id) {
        this.setState({connection: item})
      }
    })
  }

  goBack = () => {
    this.props.navigation.pop();
  };

  updateRequest = (status) => {
    let parameter = {
      id: this.state.connection.id,
      status: status
    }
    this.setState({isLoading: true})
    Api.request(Routes.circleUpdate, parameter, response => {
      this.setState({isLoading: false})
    });
  }

  removeRequest = () => {
    let parameter = {
      id: this.state.connection?.id,
    }
    console.log(this.state.connection);
    this.setState({isLoading: true})
    Api.request(Routes.circleDelete, parameter, response => {
      this.setState({isLoading: false})
      console.log(response, "remove request response");
      if(response.data !== null) {
        this.setState({title: 'Send Request'})
      }
    });
  }

  sendRequest = () => {
    let parameter = {
      account_id: this.props.state.user.id,
      to_email: this.state.user && this.state.user.email,
      content: "test"
    }
    this.setState({ isLoading: true });
    Api.request(Routes.circleCreate, parameter, response => {
      this.setState({ isLoading: false })
      console.log(response);
      this.setState({title: 'Cancel Request'})
      
    });
  }

  retrieveAccount = () => {
    let parameter = {
      condition: [{
        value: this.props.navigation.state.params.user ? this.props.navigation.state.params.user.code : this.props.navigation.state.params.code,
        clause: '=',
        column: 'code'
      }]
    }
    this.setState({ isLoading: true });
    Api.request(Routes.accountRetrieve, parameter, response => {
      this.setState({ isLoading: false })
      if (response.data.length > 0) {
        this.retrieveEducationalBackground(response.data[0].id);
        this.setState({ user: response.data[0] })
      } else {
        this.setState({ user: null })
      }
    });
  }

  retrieveEducationalBackground = (id) => {
    let parameter = {
      condition: [{
        value: id,
        clause: '=',
        column: 'account_id'
      }]
    }
    this.setState({ isLoading: true });
    Api.request(Routes.educationsRetrieve, parameter, response => {
      this.setState({ isLoading: false })
      if (response.data.length > 0) {
        this.setState({ educationalBackground: response.data[0] })
      } else {
        this.setState({ educationalBackground: null })
      }
    });
  }

  render() {
    const { user } = this.state
    const { theme } = this.props.state;
    return (
      <View>
        <View>
          <ScrollView >
            <View style={styles.container}>
              <View style={{
                height: height / 3,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: theme ? theme.primary : Color.primary
              }}>
                {user && (
                  <View>
                    <View>
                      <UserImage
                        user={{ profile: user.profile }}
                        color={Color.white} style={{
                          width: 100,
                          height: 100,
                          borderRadius: 100
                        }}
                        size={100}
                      />
                    </View>

                    <View style={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginTop: 15
                    }}>
                      <Text style={{
                        marginLeft: 5,
                        color: Color.white
                      }}>{user.username}</Text>
                    </View>
                  </View>
                )}

                {user && user.rating && (
                  <View>
                    <Rating ratings={rating} label={null}></Rating>
                  </View>
                )}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    size={16}
                    style={{
                      backgroundColor: Color.white,
                      color: Color.info,
                      borderRadius: 20,
                    }}
                  />
                  <Text style={{ color: Color.white, fontStyle: 'italic' }}>  Verified</Text>
                </View>

              </View>
              {
                user && user.information && (
                  <View>
                    <Text
                      style={{
                        borderBottomWidth: 1,
                        padding: 15,
                        fontWeight: 'bold',
                        borderColor: Color.gray,
                      }}>
                      PERSONAL INFORMATION
                    </Text>
                    <PersonalInformationCard user={user} />
                  </View>
                )
              }
              {this.state.isLoading ? <Spinner mode="overlay" /> : null}

              {/* {
                this.state.educationalBackground && (
                  <View>
                    <Text
                      style={{
                        borderBottomWidth: 1,
                        padding: 15,
                        fontWeight: 'bold',
                        borderColor: Color.gray,
                      }}>
                      EDUCATIONAL BACKGROUND
                  </Text>
                    <EducationalBackgroundCard user={this.state.educationalBackground} />
                  </View>
                )
              } */}

            </View>

          </ScrollView>
          <View style={{
            position: 'absolute',
            bottom: 5,
            left: 0,
            width: '100%'
          }}>
            { this.state.user && this.state.connection === null && this.state.status === true && user.id !== this.props.state.user.id && (<View
                style={{
                  flexDirection: 'row'
                }}>
                <Button
                  title={this.state.title}
                  onClick={this.state.title === 'Cancel Request' ? this.removeRequest : this.sendRequest}
                  style={{
                    width: '90%',
                    marginRight: '1%',
                    marginLeft: '5%',
                    backgroundColor: Color.secondary
                  }}
                />
              </View>)}
             {this.state.connection && this.state.connection.id === user.id && this.state.status === true && this.state.connection.status === 'pending' && (
              <View
                style={{
                  flexDirection: 'row'
                }}>
                <Button
                  title={'Accept'}
                  style={{
                    width: '45%',
                    marginRight: '1%',
                    marginLeft: '5%',
                    backgroundColor: Color.secondary
                  }}
                  onClick={this.updateRequest('accepted')}
                />
                <Button
                  title={'Decline'}
                  style={{
                    width: '45%',
                    marginRight: '5%',
                    backgroundColor: Color.danger
                  }}
                  onClick={this.updateRequest('declined')}
                />
              </View>
            )}
            {this.state.connection &&
            this.state.connection.id === this.props.state.user.id &&
            this.state.status === true &&
            this.props.state.user.id !== this.state.connection.id &&
            this.state.connection.status === 'pending' && (
              <View
                style={{
                  flexDirection: 'row'
                }}>
                <Button
                  title={'Cancel Request'}
                  style={{
                    width: '90%',
                    marginRight: '1%',
                    marginLeft: '5%',
                    backgroundColor: Color.secondary
                  }}
                  onClick={this.removeRequest}
                />
              </View>
            )}
            {this.state.connection &&
            (this.state.connection.id === this.props.state.user.id &&
            this.state.status === true &&
            this.props.state.user.id !== this.state.connection.id || this.state.connection.id === user.id) &&
            this.state.connection.status === 'accepted' && (
              <View
                style={{
                  flexDirection: 'row'
                }}>
                <Button
                  title={'Remove'}
                  style={{
                    width: '90%',
                    marginRight: '1%',
                    marginLeft: '5%',
                    backgroundColor: Color.danger
                  }}
                  onClick={this.removeRequest}
                />
              </View>
            )}
            {this.state.connection?.id === this.state.user?.id &&
            this.state.connection?.status === 'declined' && (
              <View
                style={{
                  flexDirection: 'row'
                }}>
                <Button
                  title={this.state.title}
                  onClick={this.state.title === 'Cancel Request' ? this.removeRequest : this.sendRequest}
                  style={{
                    width: '90%',
                    marginRight: '1%',
                    marginLeft: '5%',
                    backgroundColor: Color.secondary
                  }}
                />
              </View>
            )}
          </View>
        </View>
      </View >
    );
  }
}
const mapStateToProps = (state) => ({ state: state });

const mapDispatchToProps = (dispatch) => {
  const { actions } = require('@redux');
  return {
    setMessengerGroup: (messengerGroup) => dispatch(actions.setMessengerGroup(messengerGroup))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ViewProfile);
