import React, { Component } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Image, TouchableHighlight, Dimensions, ScrollView } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUserCircle, faStar as Solid } from '@fortawesome/free-solid-svg-icons';
import {faStar as Regular} from '@fortawesome/free-regular-svg-icons';
import Button from 'components/Form/Button';
import Currency from 'services/Currency';
import {connect} from 'react-redux';
import {BasicStyles, Color, Routes} from 'common';
import Api from 'services/api/index.js';
import RequestCard from 'modules/generic/RequestCard';

const height = Math.round(Dimensions.get('window').height);
class TransferFundCard extends Component {
  constructor(props){
    super(props)
    this.state = {
    }
  }
  
  componentDidMount = () => {
    this.retrieve()
  }

  retrieve(){
    const { user } = this.props.state;
    const { messengerGroup } = this.props.state;
    if(user == null || messengerGroup == null){
      return
    }
    let parameter = {
      request_id: messengerGroup.id,
      account_code: user.code,
      account_request_code: messengerGroup.account_id
    };
    this.setState({isLoading: true});
    console.log('[RequestItem] Retrieve parameter', parameter)
    Api.request(Routes.requestPeerRetrieveItem, parameter, (response) => {
      this.setState({isLoading: false});
      console.log('response', response.data.account)
      if (response.data.length > 0) {
        this.setState({
          peer: response.data
        })
      } else {
        this.setState({
          peer: null
        })
      }
    }, error => {
      console.log('response', error)
      this.setState({isLoading: false, peer: null});
    });
  }


  render() {
    const {user, theme, messengerGroup} = this.props.state
    const { data } = this.props.navigation.state.params;
    return (
      <SafeAreaView>
        <ScrollView
          showsVerticalScrollIndicator={false}>

            <View style={{
              height: height,
              width: '90%',
              marginRight: '5%',
              marginLeft: '5%'
            }}>
              {
                (data) && (<RequestCard 
                  data={data}
                  navigation={this.props.navigation}
                />)
              }


              <View style={{
                height: 50,
                justifyContent: 'center',
                borderBottomWidth: 1,
                borderBottomColor: Color.lightGray
              }}>
                <Text style={{
                  fontWeight: 'bold',
                  fontSize: BasicStyles.standardFontSize
                }}>Summary</Text>
              </View>

              {
                (data && data.peer) && (
                  <View>
                    <View style={{
                      height: 50,
                      justifyContent: 'center',
                      alignItems: 'center',
                      flexDirection: 'row'
                    }}>
                      <Text style={{
                        fontSize: BasicStyles.standardFontSize,
                        width: '60%'
                      }}>Requested Amount</Text>

                      <Text style={{
                        fontSize: BasicStyles.standardFontSize,
                        width: '40%',
                        textAlign: 'right'
                      }}>{Currency.display(data.amount, data.currency)}</Text>
                    </View>
                    <View style={{
                      height: 50,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderBottomWidth: 1,
                      borderBottomColor: Color.lightGray,
                      flexDirection: 'row'
                    }}>
                      <Text style={{
                        fontSize: BasicStyles.standardFontSize,
                        width: '60%'
                      }}>Processing fee</Text>

                      <Text style={{
                        fontSize: BasicStyles.standardFontSize,
                        width: '40%',
                        textAlign: 'right'
                      }}>{Currency.display(data.peer.charge, data.peer.currency)}</Text>
                    </View>

                    <View style={{
                      height: 50,
                      justifyContent: 'center',
                      alignItems: 'center',
                      flexDirection: 'row'
                    }}>
                      <Text style={{
                        fontSize: BasicStyles.standardFontSize,
                        width: '60%',
                        fontWeight: 'bold'
                      }}>Remaining</Text>

                      <Text style={{
                        fontSize: BasicStyles.standardFontSize,
                        width: '40%',
                        fontWeight: 'bold',
                        textAlign: 'right'
                      }}>{Currency.display((parseFloat(data.amount) - parseFloat(data.peer.charge)), data.peer.currency)}</Text>
                    </View>
                  </View>
                )
              }
              
            </View>

        </ScrollView>
        {
          (data && data.type == 1 && data.account_id == user.id) && (
            <View style={{
              alignItems: 'center',
              backgroundColor: Color.white,
              width: '100%',
              flexDirection: 'row',
              position: 'absolute',
              bottom: 10,
              paddingLeft: 20,
              paddingRight: 20,
              left: 0
            }}>

              <Button 
                title={'Cancel'}
                onClick={() => this.props.navigation.pop()}
                style={{
                  width: '45%',
                  marginRight: '5%',
                  backgroundColor: Color.danger,
                }}
              />

              <Button 
                title={'Continue'}
                onClick={() => this.props.navigation.navigate('otpStack', {
                  data: {
                    payload: 'transferFund',
                    data: data
                  }
                })}
                style={{
                  width: '45%',
                  marginLeft: '5%',
                  backgroundColor: theme ? theme.secondary : Color.secondary
                }}
              />
            </View>
          )
        }
      </SafeAreaView>
    )
  }
}

const mapStateToProps = state => ({ state: state });

const mapDispatchToProps = dispatch => {
  const { actions } = require('@redux');
  return {};
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TransferFundCard);