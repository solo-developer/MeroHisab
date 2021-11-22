using MeroHisab.CustomControls;
using MeroHisab.ViewModels;
using Xamarin.Forms;

namespace MeroHisab.Views
{
    public partial class MainPage : ContentPage
    {
        public MainPage()
        {
            InitializeComponent();
            BindingContext = App.GetViewModel<MainPageModel>();
        }

        private void TabView_SelectionChanged(object sender, Xamarin.CommunityToolkit.UI.Views.TabSelectionChangedEventArgs e)
        {            
            if (e.NewPosition == 0 && !HomeTabContent.IsLoaded)
                HomeTabContent.LoadViewAsync();
            if (e.NewPosition == 1 && !ReportsTabContent.IsLoaded)
                ReportsTabContent.LoadViewAsync();
            if (e.NewPosition == 2 && !SettingsTabContent.IsLoaded)
                SettingsTabContent.LoadViewAsync();
            if (e.NewPosition == 3 && !ProfileTabContent.IsLoaded)
                ProfileTabContent.LoadViewAsync();
           
        }
    }
}
