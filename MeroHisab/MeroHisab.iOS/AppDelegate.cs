using FormsPinView.iOS;
using Foundation;
using ImageCircle.Forms.Plugin.iOS;
using MeroHisab.Helpers.Interface;
using MeroHisab.iOS.Services;
using MeroHisab.Services.Interface;
using Microsoft.Extensions.DependencyInjection;
using UIKit;

namespace MeroHisab.iOS
{
    // The UIApplicationDelegate for the application. This class is responsible for launching the 
    // User Interface of the application, as well as listening (and optionally responding) to 
    // application events from iOS.
    [Register("AppDelegate")]
    public partial class AppDelegate : global::Xamarin.Forms.Platform.iOS.FormsApplicationDelegate
    {
        //
        // This method is invoked when the application has loaded and is ready to run. In this 
        // method you should instantiate the window, load the UI into it and then make the window
        // visible.
        //
        // You have 17 seconds to return from this method, or iOS will terminate your application.
        //
        public override bool FinishedLaunching(UIApplication app, NSDictionary options)
        {
            Rg.Plugins.Popup.Popup.Init();
            global::Xamarin.Forms.Forms.Init();
            ImageCircleRenderer.Init();
            PinItemViewRenderer.Init();
            FFImageLoading.Forms.Platform.CachedImageRenderer.Init();
            LoadApplication(new App(AddServices));

            return base.FinishedLaunching(app, options);
        }

        static void AddServices(IServiceCollection services)
        {
            services.AddTransient<IToastService, ToastService>();
            services.AddTransient<IEnvironmentService, EnvironmentService>();
        }
    }
}
