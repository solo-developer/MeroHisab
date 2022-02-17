using MeroHisab.ViewModels;
using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace MeroHisab.LazyViews
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class DashboardHomePage : ContentView
    {
        public DashboardHomePage()
        {
            InitializeComponent();
            var vm = App.GetViewModel<DashboardHomePageModel>();
            Content.BindingContext = vm;
        }
    }
}