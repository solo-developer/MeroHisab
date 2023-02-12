using MeroHisab.Helpers.Interface;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Xamarin.CommunityToolkit.ObjectModel;
using Xamarin.Forms;

namespace MeroHisab.ViewModels
{
    public class DashboardReportsPageModel : ViewModelBase
    {
        public IAsyncCommand ReportsByAccountHeadCommand { get; set; }

        private readonly INotificationService _notificationService;
        public DashboardReportsPageModel(INotificationService notificationService)
        {
            _notificationService = notificationService;
            ReportsByAccountHeadCommand = new AsyncCommand(NaviagateToReportsByAccountHeadPage);
        }

        private async Task NaviagateToReportsByAccountHeadPage()
        {
            await _navigationService.NavigateToAsync<ReportByAccountHeadPageModel>();
        }
    }
}
