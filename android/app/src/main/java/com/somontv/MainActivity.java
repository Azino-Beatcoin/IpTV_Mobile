package com.somontv;

import com.facebook.react.ReactActivity;
import android.content.Intent;
import android.content.res.Configuration;
import android.os.Bundle; // here
import com.facebook.react.ReactActivity;
import org.devio.rn.splashscreen.SplashScreen;// here

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "somontv";
  }

     @Override
     public void onConfigurationChanged(Configuration newConfig) {
         super.onConfigurationChanged(newConfig);
         Intent intent = new Intent("onConfigurationChanged");
         intent.putExtra("newConfig", newConfig);
         this.sendBroadcast(intent);
     }
       @Override
         protected void onCreate(Bundle savedInstanceState) {
             SplashScreen.show(this);  // here
             super.onCreate(savedInstanceState);
         }
}
