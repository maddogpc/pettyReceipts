import { NavigationActions } from 'react-navigation';
import { RootNavigator } from '../navigators/AppNavigator';

// Start with two routes: The Main screen, with the Login screen on top.
const firstAction = RootNavigator.router.getActionForPathAndParams('Main');
const tempNavState = RootNavigator.router.getStateForAction(firstAction);
// const secondAction = RootNavigator.router.getActionForPathAndParams('Login');
const initialNavState = RootNavigator.router.getStateForAction(
  firstAction,
  tempNavState
);

export default function nav(state = initialNavState, action) {
  let nextState;
  switch (action.type) {
    case 'Main':
      nextState = RootNavigator.router.getStateForAction(
        NavigationActions.navigate({ routeName: 'Main'}),
        state
      );
      break;
    case 'Groups':
      nextState = RootNavigator.router.getStateForAction(
        NavigationActions.navigate({ routeName: 'Groups' }),
        state
      );
      break;
    default:
      nextState = RootNavigator.router.getStateForAction(action, state);
      break;
  }

  // Simply return the original `state` if `nextState` is null or undefined.
  return nextState || state;
}