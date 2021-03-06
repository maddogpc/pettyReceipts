import React, {Component} from 'react';
import {Platform, StyleSheet, Modal, Text, TouchableHighlight, ScrollView, View, TextInput, 
  ListView, Button, TouchableOpacity, Image, Dimensions, KeyboardAvoidingView} from 'react-native';
// import { KeyboardAvoidingView } from 'react-native';

import { Constants, Camera, Permissions } from 'expo';
import isIPhoneX from 'react-native-is-iphonex';
import KeyboardListener from 'react-native-keyboard-listener';
import { Keyboard } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { Dropdown } from 'react-native-material-dropdown';
import { CheckBox } from 'react-native-elements'
import { 
  FontAwesome,
  MaterialIcons,
  Foundation,
  MaterialCommunityIcons,
  Octicons
} from '@expo/vector-icons';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import CameraContainer from './CameraContainer';
import TextComponentContainer from './TextComponentContainer';
import ListItem from './ListItem';

export default class NewReciept extends Component {
  constructor(props) {
      super(props);

  this.state = {

    isPageOne: true,
    isCameraPage: false,
    isPageTwo: false,

    hasCameraPermission: null,
    type: Camera.Constants.Type.back,
    isCameraPage: false,
    isPictureReciept: false,
    pictureLocation: "",

    //Page 2
    tagElements: [],
    createTagModalVisible: false,
    tagSelected: "None",

    groupElements: [],
    createGroupModalVisible: false,
    groupNameInputVal: "",

    tagNameInputVal: "",
    tagTypeSelected: "",
  };
}

  setModalVisible(visible) {
    this.setState({modalVisible: visible});
  }

  onPressTakePhoto = () => {
    let permissionStatus;
    let asyncExample = async () => {
      return await Permissions.askAsync(Permissions.CAMERA);
    };
    asyncExample().then(users => {
      const { status } = users;
      permissionStatus = status;
      console.log(permissionStatus);
    })
    .catch(err => console.error(err))
    this.setState({ isPageOne: false, isPageTwo: false, isCameraPage: true, isPictureReciept: false });
  }

  onPressSkip = () => {
    this.setState({isPageOne: false, isPageTwo:true});
  }

  closeCamera = () => {
    this.setState({isPageOne: true, isCameraPage: false});
  }

  pictureSavedCallback = (pictureLocation) => {
    this.setState({ isPageOne: false, isPageTwo: true, isCameraPage: false,
     isPictureReciept: true, pictureLocation });
  }

  createGroupModal = () => {
    let groupName = this.state.groupNameInputVal;
    this.props.createGroup( groupName, [] );
    this.setState({createGroupModalVisible: false});
  }

  createTagModal = () => {
    let tagName = this.state.tagNameInputVal;
    let tagType = this.state.tagTypeSelected;

    this.props.createTag( tagName, tagType );
    this.setState({createTagModalVisible: false});
  }

  onSelectTagType = (text) => {
    this.setState({tagTypeSelected: text});
  }

  onPressAddReciept = () => {
    let groupArray = [];
    let tagArray = [];

    let groupItemsTemp = this.props.groups.groupItems;
    let groupKeys = Object.keys(groupItemsTemp);
    groupKeys.map((groupName) => {
      if (this.state[groupName]) {
        console.log(groupName);
        this.props.addToGroup(groupName, this.props.id);
        groupArray.push(groupName);
      }
    });

    let tagItemsTemp = this.props.tags.tagItems;
    let tagKeys = Object.keys(tagItemsTemp);
    tagKeys.map((tagName) => {
      if (this.state[tagName]) {
          this.props.addTagInstance(tagName, this.props.id, this.state[tagName]);
          tagArray.push({name: tagName, value: this.state[tagName]});
      }
      else if (this.state["first"+tagName] && this.state["second"+tagName] && this.state["third"+tagName]) {
          let fullDate = this.state["first"+tagName] + "/" + this.state["second"+tagName] + "/" + this.state["third"+tagName];
          this.props.addTagInstance(tagName, this.props.id, fullDate);
          tagArray.push({name: tagName, value: fullDate});
        }
    });

    this.props.createReciept(
      this.state.nameInputVal, 
      "", 
      this.state.pictureLocation, 
      groupArray, 
      tagArray
      );

    this.props.onClose();
  }

  onSubmitHandler(name, dateProp) {
    // console.log(index);
    let tagItemsTemp = this.props.tags.tagItems;
    let tagKeys = Object.keys(tagItemsTemp);
    let found = false;
    console.log(name, dateProp);
    for (let i=0; i<tagKeys.length; i++) {
      if (tagKeys[i] === name) {
        if (dateProp === "first") {
          this["second"+name].focus(); 
        }
        else if (dateProp === "second") {
          this["third"+name].focus(); 
        }
        else {
          let key = tagKeys[i+1];
          if (this[key]) {
            this[key].focus();
          }
          else if (this["first"+key]) {
            this["first"+key].focus();
          }
        }
      }
    }
  }

  render() {
    const tagTypeData = [
      { value: 'Number', label: 'Number (integer or decimal)' },
      { value: 'Text', label: 'Text (any)' },
      { value: 'Date', label: 'Date (dd/mm/yyyy)' },
      { value: 'Boolean', label: 'True/False' },
    ];

    const win = Dimensions.get('window');
    if (this.state.isPageOne) {
    return (
        <Modal
          animationType="slide"
          transparent={false}
          visible={this.state.modalVisible}
          onRequestClose={() => {
            //alert('Modal has been closed.');
          }}> 
            <View style={pageOneStyles.menuContainer}>
              <View style={pageOneStyles.subMenu}>
                <Text style={{fontSize:28, fontFamily: 'zilla-slab.semibold', borderWidth: 0, color: "#FFF"}}>Add Receipt</Text>
                <MaterialIcons name="close" size={40} color="white" onPress={() => {
                      this.props.onClose();
                    }}/>
              </View>
            </View>
            <View style={pageOneStyles.ButtonOneContainer}>
              <TouchableOpacity style={{alignItems:'center', justifyContent: 'center', 
              width:'100%', backgroundColor: '#b0d235', borderWidth:1}} 
              onPress={this.onPressTakePhoto}>
                    <Text style={{fontSize:24, fontFamily: 'zilla-slab.semibold', color: '#fff'}}>Take Photo</Text>
              </TouchableOpacity>
              
            </View>
            <View style={pageOneStyles.ButtonTwoContainer}>
              <TouchableOpacity style={{alignItems:'center', justifyContent: 'center',
               width:'100%', backgroundColor: '#3ea9c1', borderWidth:1}} 
               onPress={this.onPressSkip}>
                    <Text style={{fontSize:24, fontFamily: 'zilla-slab.semibold', color: '#fff'}}>Skip</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        );
      }
      else if (this.state.isCameraPage) {
        return (
          <Modal
            animationType="slide"
            transparent={false}
            visible={this.state.modalVisible}
            onRequestClose={() => {
              //alert('Modal has been closed.');
            }}> 
            <CameraContainer close={this.closeCamera} pictureSavedCallback={this.pictureSavedCallback}/>
            </Modal>
          );
      }
      else if (this.state.isPageTwo) {
        let groupItemsTemp = this.props.groups.groupItems;
        let groupElements = [];
        if (groupItemsTemp) {
          groupElements = Object.keys(groupItemsTemp).map(name => {
            return ( 
              <View key={name} style={{flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 10}}>
                  <Text style={{marginLeft:10, fontFamily: 'monospace-typewriter', borderWidth: 0, backgroundColor: "#D3D3D3", padding:2}}>{name}</Text>
                  <CheckBox
                    title='INCLUDE'
                    containerStyle={{padding:0, margin:0}}
                    checked={this.state[name]}
                    onPress={() => this.setState({[name]: !this.state[name]})}
                  />
              </View>
            );
          });
        }
        let tagItemsTemp = this.props.tags.tagItems;
        let tagElements = [];
        if (tagItemsTemp) {
          tagElements = Object.keys(tagItemsTemp).map((name,i) => {
            let type = tagItemsTemp[name].type;
            let initialState;
            return ( 
              <View key={name} style={{flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 10}}>
                  <Text style={{marginLeft:10, fontFamily: 'monospace-typewriter', backgroundColor: "#D3D3D3", padding:2}}>{name}</Text>
                  {type === "Date" ? (
                    <View style={{flexDirection: 'row'}}>
                      <TextInput 
                        style={{
                        height: 25, 
                        width: 50,
                        marginRight: 10,
                        borderColor: 'gray', 
                        borderWidth: 1,
                        textAlignVertical: 'top'}}
                        placeholder = {"dd"}
                        onChangeText={(text) => this.setState({["first"+name]: text})}
                        returnKeyType={"next"}
                        onSubmitEditing={() => this.onSubmitHandler(name, "first")}
                        blurOnSubmit={false}
                        value = {this.state["first"+name]}
                        ref={(input) => { this["first"+name] = input; }}
                        />
                      <TextInput 
                        style={{
                        height: 25, 
                        width: 50,
                        marginRight: 10,
                        borderColor: 'gray', 
                        borderWidth: 1,
                        textAlignVertical: 'top'}}
                        placeholder = {"mm"}
                        onChangeText={(text) => this.setState({["second"+name]: text})}
                        returnKeyType={"next"}
                        onSubmitEditing={() => this.onSubmitHandler(name, "second")}
                        blurOnSubmit={false}
                        value = {this.state["second"+name]}
                        ref={(input) => { this["second"+name] = input; }}
                        />
                      <TextInput 
                        style={{
                        height: 25, 
                        width: 50,
                        marginRight: 10,
                        borderColor: 'gray', 
                        borderWidth: 1,
                        textAlignVertical: 'top'}}
                        placeholder = {"yyyy"}
                        onChangeText={(text) => this.setState({["third"+name]: text})}
                        returnKeyType={"next"}
                        onSubmitEditing={() => this.onSubmitHandler(name, null)}
                        blurOnSubmit={false}
                        value = {this.state["third"+name]}
                        ref={(input) => { this["third"+name] = input; }}
                        />
                    </View>
                    ) : (
                  <TextInput
                    style={{
                    height: 25, 
                    width: 200,
                    marginRight: 10,
                    borderColor: 'gray', 
                    borderWidth: 1,
                    textAlignVertical: 'top'}}
                    // ref={name}
                    placeholder= {
                      type === "Number" ? "$" 
                    : type === "Text" ? "Text" 
                    : type === "Boolean" ? "True/False"
                    : ""
                  }
                    returnKeyType={"next"}
                    onSubmitEditing={() => this.onSubmitHandler(name, null)}
                    blurOnSubmit={false}
                    onChangeText={(text) => this.setState({[name]: text})}
                    value = {this.state[name]}
                    ref={(input) => { this[name] = input; }}
                  />
                  )}
              </View>
            );
          });
        }

        return (
          <Modal
          animationType="slide"
          transparent={false}
          visible={this.state.modalVisible}
          onRequestClose={() => {
            //alert('Modal has been closed.');
          }}> 
          <View style={{flex:1}}>
            <View style={pageTwoStyles.menuContainer}>
                    <MaterialIcons name="keyboard-backspace" size={50} color="white" onPress={() => {
                          this.setState({isPageOne: true, isPageTwo: false});
                        }}/>
                    <MaterialIcons name="close" size={40} color="white" onPress={() => {
                          this.props.onClose();
                        }}/>
                </View>
            <View style={{flex:.9}}>
            <ScrollView>
              
              <View style={{padding: 5}}>
                <Text style={{paddingRight:5, fontSize:16}}>Name (Optional): </Text>
                <TextInput
                  style={pageTwoStyles.textInput}
                  onChangeText={(nameInputVal) => this.setState({nameInputVal})}
                  value={this.state.nameInputVal}
                />
              </View>

              <View style={{marginTop: 20, padding: 5}}>
                <Text style={{fontSize: 24, fontFamily: 'monospace-typewriter', color: '#042037'}}>Group(s):</Text>
              </View>
              
              {groupElements}
              <TouchableOpacity
                 style={{alignSelf: 'center', width:'95%', marginTop:10, borderWidth: 1, backgroundColor: '#b0d235'}}
                 onPress={this.onPressAddReciept}
               >
                 <Text 
                 onPress={() => this.setState({createGroupModalVisible:true})}
                 style={{alignSelf: 'center', fontSize:24, fontFamily: 'zilla-slab.semibold', color: '#fff'}}> Create New Group </Text>
               </TouchableOpacity>

               <View style={{marginTop: 20, padding: 5}}>
                <Text style={{fontSize: 24, fontFamily: 'monospace-typewriter', color: '#042037'}}>Fields(s):</Text>
              </View>
              {tagElements}

              <TouchableOpacity
                 style={{alignSelf: 'center', width:'95%', marginTop:10, borderWidth: 1, backgroundColor: '#b0d235'}}
                 
                 onPress={() => this.setState({createTagModalVisible:true})}
               >
                 <Text 
                 
                 style={{alignSelf: 'center', fontSize:24, fontFamily: 'zilla-slab.semibold', color: '#fff'}}> Create New Field </Text>
               </TouchableOpacity>
               

               {this.state.isPictureReciept ? ( 
              <Image
                resizeMode={'contain'}
                style={{alignSelf: 'center', width: (win.width*.95), height: (win.height*.7)}}
                source={{uri: this.state.pictureLocation}}
              />
              ) : (
              null
            )}

              <View style={{flex:.1}}>
               <TouchableOpacity
                 style={{alignSelf: 'center', width:'95%', marginTop:10, borderWidth: 1, backgroundColor: '#3ea9c1', marginBottom: 10, alignSelf: 'center'}}
                 onPress={this.onPressAddReciept}
               >
                 <Text 
                 style={{alignSelf: 'center', fontSize:24, fontFamily: 'zilla-slab.semibold', color: '#fff'}}> Create Receipt </Text>
               </TouchableOpacity>
               </View>

              </ScrollView>
              </View>

            </View>

               {this.state.createGroupModalVisible ? (
                <View style={{
                  position: 'absolute', 
                  left: (win.width/5), 
                  width: (win.width*.6), 
                  top: (win.height/6), 
                  height: (win.height*.2), 
                  backgroundColor: 'white',
                  borderWidth: 1,
                }}>
                    <Text style={{fontSize:20, marginTop: 5, marginLeft: 5}}> Name:</Text>
                    <TextInput
                      style={{
                      marginTop: 10,
                      width: '95%',
                      borderColor: 'gray', 
                      borderWidth: 1,
                      textAlignVertical: 'top',
                      alignSelf: 'center',
                    }}
                      onChangeText={(groupNameInputVal) => this.setState({groupNameInputVal})}
                      value={this.state.groupNameInputVal}
                    />
                    <View style={{
                      width: '100%',
                      justifyContent: 'space-between', 
                      flexDirection: 'row', 
                      position: 'absolute', 
                      bottom: 10
                    }}>
                      <Button
                        onPress={() => this.setState({createGroupModalVisible:false})}
                        title="No"
                        color="red"
                        accessibilityLabel="Learn more about this purple button"
                      />
                      <Button
                        onPress={this.createGroupModal}
                        title="Create"
                        color="teal"
                        accessibilityLabel="Learn more about this purple button"
                      />
                    </View>
                </View>
                ) : (
                null
                )}

                {this.state.createTagModalVisible ? (
                  <View style={{
                    position: 'absolute', 
                    left: (win.width/5), 
                    width: (win.width*.6), 
                    bottom: (win.height/6), 
                    height: (win.height*.3), 
                    backgroundColor: 'white',
                    borderWidth: 1,
                  }}>
                      <Text style={{fontSize:20, marginTop: 5, marginLeft: 5}}> Field Name:</Text>
                      <TextInput
                        style={{
                        marginTop: 10,
                        width: '95%',
                        borderColor: 'gray', 
                        borderWidth: 1,
                        textAlignVertical: 'top',
                        alignSelf: 'center',
                      }}
                        onChangeText={(tagNameInputVal) => this.setState({tagNameInputVal})}
                        value={this.state.tagNameInputVal}
                      />
                      <View style={{flexDirection:'row'}}>
                      <Dropdown
                        containerStyle={{width: '95%', left: 5}}
                        value={this.state.tagTypeSelected}
                        data={tagTypeData}
                        label='Field Type'
                        labelFontSize={16}
                        onChangeText={this.onSelectTagType}
                      />
                      </View>
                      <View style={{
                        width: '100%',
                        justifyContent: 'space-between', 
                        flexDirection: 'row', 
                        position: 'absolute', 
                        bottom: 10
                      }}>
                        <Button
                          onPress={() => this.setState({createTagModalVisible:false})}
                          title="No"
                          color="red"
                          accessibilityLabel="Learn more about this purple button"
                        />
                        <Button
                          onPress={this.createTagModal}
                          title="Create"
                          color="teal"
                          accessibilityLabel="Learn more about this purple button"
                        />
                      </View>
                  </View>
                  ) : (
                  null
                  )}

            
          </Modal>
          );
      }
  }
}

let marginTop = (Platform.OS === 'ios' ? 45 : 0);
const pageOneStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    width: '100%',
  },
  menuContainer: {
    marginTop: marginTop,
    backgroundColor: '#3ea9c1',
    //alignItems: 'center',
    width: '100%',
    padding: 10,
    flex: .1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  subMenu: {
    width: '75%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ButtonOneContainer: {
    //marginTop: marginTop,
    // backgroundColor: '#000',
    //alignItems: 'center',
    //width: '100%',
    padding: 10,
    flex: .6,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  ButtonTwoContainer: {
    //marginTop: marginTop,
    // backgroundColor: '#ccb',
    //alignItems: 'center',
    //width: '100%',
    padding: 10,
    flex: .3,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  pasteText: {
    marginTop: 10,
    width: 300,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  textInput: {
    height: 250, 
    width: 300,
    borderColor: 'gray', 
    borderWidth: 1,
    textAlignVertical: 'top',
  },
  addButton: {
    marginTop: 40,
    width: 300,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  buttons: {
    borderWidth: 1,
    backgroundColor: '#a9ccbf',
  },
  orUseContainer: {
    marginTop: 0,
    width: 300,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  photoButton: {
    marginTop: 40,
    width: 300,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});

const pageTwoStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#d3dee7',
  },
  menuContainer: {
    marginTop: marginTop,
    backgroundColor: '#3ea9c1',
    alignItems: 'center',
    width: '100%',
    padding: 10,
    flex: .1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textInputContainer: {
    width: "90%",
    flexDirection: 'column',
  },
  textInputContainer2: {
    width: "90%",
    flexDirection: 'row',
  },
  textInput: {
    height: 25, 
    width: "100%",
    borderColor: 'gray', 
    borderWidth: 1,
    textAlignVertical: 'top',
  },
});