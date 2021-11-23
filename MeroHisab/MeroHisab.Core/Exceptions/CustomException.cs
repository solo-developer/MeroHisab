using System;

namespace MeroHisab.Core.Exceptions
{
    public class CustomException : Exception
    {
        public CustomException()
        {

        }
        public CustomException(string message) : base(message)
        {

        }
    }
}
