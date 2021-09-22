import {
  BackHandler,
  StyleSheet,
  TouchableOpacity,
  View,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import React, {Fragment, useCallback, useEffect, useRef, useState} from 'react';
import {bindActionCreators} from 'redux';
import * as actions from '../redux/actions';
import {header} from './helper';
import {useDispatch, useSelector} from 'react-redux';
import {colors} from '../templates/colors';
import {fSize, percentHeight, percentWidth} from '../templates/helper';
import Loader from './Loader';
import {Button} from 'react-native';
import {Text} from 'react-native';
import VideoPlayer from 'react-native-video'
import {useFocusEffect} from '@react-navigation/native';
import Orientation from 'react-native-orientation-locker';

const VPlayer = ({
  navigation = null,
  autoShowHeader = false,
  back = null,
  uri = null,
  onFull = null,
  onPlay,
  autoPlay = true,
  isTv = false,
}) => {
  const [rUri, setRUri] = useState(null);
  const dispatch = useDispatch();
  const [orientation, setOrientation] = useState('PORTRAIT');
  const [showFullIcon, setShowFullIcon] = useState(false);
  const [fullSize, setFullSize] = useState(false);
  const [visibleStatusBar, setVisibleStatusBar] = useState(false);
  const [play, setPlay] = useState(autoPlay);
  const [loader, setLoader] = useState(false);
  const [currentTime, setCurrentTime] = useState(0.0);
  const playerRef = useRef(null);
  const sid = useSelector((state) => state.authReducer.sid);
  const musicPlays = useSelector((state) => state.playerReducer.musicIsPlaying)
  const [showLeftSkipButton, setShowLeftSkipButton] = useState(false);
  const [showRightSkipButton, setShowRightSkipButton] = useState(false);
  const [duration, setDuration] = useState(0);
  const [playerWidth, setPlayerWidth] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [showPlayBtn, setShowPlayBtn] = useState(false);
  let interval = null;
  let timeOutID;
  let controlTimerId;
  const getCurrentTimePercentage = () => {
    if (currentTime > 0 && duration > 0) {
      return parseFloat(currentTime) / parseFloat(duration);
    }
    return 0;
  };

  useEffect(() => {
    dispatch(actions.setMusicPlayer(false))
  }, [])

  useEffect(() => {
    return () => {
      playerRef.current = null;
    };
  }, []);
  useFocusEffect(
    useCallback(() => {
      BackHandler.addEventListener('hardwareBackPress', () => {
        headerShown(true);
        dispatch(actions.setNavigationVisibility(true));
        setOrientation('PORTRAIT');
      });
      return () => {
        setRUri(null);
        setOrientation('PORTRAIT');
        Orientation.lockToPortrait();
        dispatch(actions.setNavigationVisibility(true));
        dispatch(actions.getHistory(sid));
     
      };
    }, []),
  );
  useEffect(() => {
    if (uri) {
      const rr = uri.replace('https','http');
      setRUri(rr);
    }
  }, [uri]);

  const hideFull = () => {
    setShowFullIcon(false);
  };

  const showFull = () => {
    setShowFullIcon(true);
    if (interval) {
      clearTimeout(interval);
      interval = setTimeout(hideFull, 3790);
      return;
    }
    interval = setTimeout(hideFull, 3790);
  };

  const headerShown = (show) => {
    if (autoShowHeader) {
      header(navigation, show);
    }
  };
  const videoSizeChange = () => {
    if (orientation === 'PORTRAIT') {
      setOrientation('LANDSCAPE');
      Orientation.lockToLandscape();
      headerShown(false);
      dispatch(actions.setNavigationVisibility(false));
      setVisibleStatusBar(true);
    } else {
      setOrientation('PORTRAIT');
      Orientation.lockToPortrait();
      headerShown(true);
      dispatch(actions.setNavigationVisibility(true));
      setVisibleStatusBar(false);
    }
  };

  const onProgress = ({currentTime}) => {
    setCurrentTime(currentTime)

  };

  const twodigit = (digit) => (+digit > 9 ? `${digit}` : `0${digit}`);

  const getVideoTimeFormat = (seconds) => {
    return new Date(seconds * 1000).toISOString().substr(11, 8)

  };

  const showStatusBar = () => {
    setShowControls(true);
    setShowPlayBtn(true);
    if (controlTimerId) {
      clearTimeout(controlTimerId);
      controlTimerId = setTimeout(() => {
        setShowControls(false);
        setShowPlayBtn(false);
      }, 3000);
      return;
    }
    controlTimerId = setTimeout(() => {
      setShowControls(false);
      setShowPlayBtn(false);
    }, 3000);
  };

  if (!uri) {
    return <Loader />;
  }

  return (
    <View>
      <StatusBar hidden={visibleStatusBar} backgroundColor={colors.primary} />
      <View style={fullSize ? styles.videoFull : styles.video}>
        <TouchableOpacity
          onPressIn={() => {
            showFull();
            showStatusBar();
            setShowPlayBtn(!showPlayBtn);
          }}>
          <VideoPlayer
            ref={playerRef}
            style={{
              height: '100%',
              width: '100%',
            }}
            videoAspectRatio="16:9"
            // autoAspectRatio={true}
            // source={require('../video/1.mp4')}
            source={{uri: rUri}}
            playInBackground={false}
            resizeMode="cover"
            fullscreen={true}
            paused={!play}
            onProgress={onProgress}
            onLoad={({ duration}) => setDuration(duration)}
            onBuffer={(buffer) => console.buffer('buffer:', buffer)}
            onReadyForDisplay={() => setLoader(false)}
            onError={(err) => {
              console.log('err:', err);
              setLoader(false);
            }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            position: 'absolute',
            bottom: percentHeight(5),
            top: percentHeight(5),
            left: percentWidth(10),
            width: percentWidth(20),
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => {
            playerRef.current.seek(currentTime  - 10);
            setShowLeftSkipButton(true);
            if (timeOutID) {
              clearTimeout(timeOutID);
            }

            timeOutID = setTimeout(() => setShowLeftSkipButton(false), 2000);
          }}>
          {showLeftSkipButton && (
            <Fragment>
              <Icon
                name="play-back-outline"
                color={colors.secondary}
                size={fSize(20)}
              />
              <Text
                style={{
                  color: colors.secondary,
                  fontSize: fSize(16),
                }}>
                -10 сек
              </Text>
            </Fragment>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            position: 'absolute',
            bottom: percentHeight(5),
            top: percentHeight(5),
            right: percentWidth(10),
            width: percentWidth(20),
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => {
            playerRef.current.seek(currentTime  + 10);
            setShowRightSkipButton(true);
            if (timeOutID) {
              clearTimeout(timeOutID);
            }

            timeOutID = setTimeout(() => setShowRightSkipButton(false), 2000);
          }}>
          {showRightSkipButton && (
            <Fragment>
              <Icon
                name="play-forward-outline"
                color={colors.secondary}
                size={fSize(20)}
              />
              <Text
                style={{
                  color: colors.secondary,
                  fontSize: fSize(16),
                }}>
                +10 сек
              </Text>
            </Fragment>
          )}
        </TouchableOpacity>
        {showFullIcon ? (
          <>
            <TouchableOpacity
              style={{
                ...styles.fullIcon,
                right:
                  orientation === 'PORTRAIT'
                    ? percentHeight(2)
                    : percentHeight(8),
              }}
              onPress={() => {
                setFullSize(!fullSize);
                videoSizeChange();
                if (onFull) {
                  onFull(!fullSize);
                }
              }}>
              <Icon name={'md-expand'} size={30} color={'#fff'} />
            </TouchableOpacity>
          </>
        ) : null}
        {loader ? <Loader /> : null}
        {showPlayBtn ? (
          <>
            <TouchableOpacity
              style={{
                position: 'absolute',
                top: StatusBar.currentHeight,
                left: 15,
              }}
              onPress={() => {
                setRUri(null);
                playerRef.current = null;
                back();
              }}>
              <Icon
                name={'arrow-back'}
                color={colors.secondary}
                size={fSize(30)}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                position: 'absolute',
                top:
                  orientation !== 'PORTRAIT'
                    ? percentHeight(25)
                    : percentHeight(13),
                alignSelf: 'center',
              }}
              onPress={() => {
                setPlay(!play);
                if (isTv) {
                  playerRef.current.resume(!play);
                }
              }}>
              {!play ? (
                <Icon name={'play'} color={colors.secondary} size={fSize(50)} />
              ) : (
                <Icon
                  name={'pause'}
                  color={colors.secondary}
                  size={fSize(50)}
                />
              )}
            </TouchableOpacity>
          </>
        ) : null}
      </View>
      {showControls && duration > 0 ? (
        <View style={styles.trackingControls}>
          <TouchableOpacity
            onLayout={({nativeEvent}) => {
              const {layout} = nativeEvent;

              setPlayerWidth(layout.width);
            }}
            onPress={({nativeEvent}) => {
              const {pageX} = nativeEvent;
              const seek =
                parseFloat(parseFloat(pageX / playerWidth) * duration - 20);
              playerRef.current.seek(seek);
              setPlay(true);
            }}>
            <View style={styles.progress}>
              <View
                style={[
                  styles.innerProgressCompleted,
                  {
                    flex: getCurrentTimePercentage() * 100,
                  },
                ]}
              />
              <View
                style={{
                  borderRadius: 15,
                  backgroundColor: colors.dark_red,
                  width: 15,
                  height: 15,
                  zIndex: 999,
                }}></View>
              <View
                style={[
                  styles.innerProgressRemaining,
                  {
                    flex: (1 - getCurrentTimePercentage()) * 100,
                  },
                ]}
              />
            </View>
          </TouchableOpacity>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <Text
              style={{
                color: '#fff',
              }}>
              {getVideoTimeFormat(currentTime)}
            </Text>

            <Text
              style={{
                color: '#fff',
              }}>
              {getVideoTimeFormat(duration)}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
};
export default VPlayer;

const styles = StyleSheet.create({
  videoFull: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  video: {
    height: percentHeight(35),
    width: '100%',
  },
  hidden: {
    height: 0,
    opacity: 0,
  },
  fullIcon: {
    position: 'absolute',
    top: StatusBar.currentHeight,
    right: percentHeight(8),
    elevation: 1,
  },
  progress: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 3,
    alignItems: 'center',
    overflow: 'hidden',
  },
  trackingControls: {
    backgroundColor: 'transparent',
    borderRadius: 5,
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  innerProgressCompleted: {
    height: 10,
    backgroundColor: colors.dark_red,
  },
  innerProgressRemaining: {
    height: 10,
    backgroundColor: '#2C2C2C',
  },
});
