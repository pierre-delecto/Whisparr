﻿using System;
using NzbDrone.Core.Backup;
using Whisparr.Http.REST;

namespace Whisparr.Api.V3.System.Backup
{
    public class BackupResource : RestResource
    {
        public string Name { get; set; }
        public string Path { get; set; }
        public BackupType Type { get; set; }
        public long Size { get; set; }
        public DateTime Time { get; set; }
    }
}
